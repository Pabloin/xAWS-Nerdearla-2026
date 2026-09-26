import assert from "node:assert/strict";
import test from "node:test";
import { DynamoDBDocumentClient, DeleteCommand, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

process.env.ADMIN_TOKEN = "test-admin-token";
const { handler } = await import("../functions/api.mjs");

function request(method, path, authorization, body) {
  return { rawPath: path, requestContext: { http: { method } },
    headers: authorization ? { authorization } : {}, body: body ? JSON.stringify(body) : undefined };
}

test("only an invited hero can publish a fresh, revocable location", async () => {
  const items = new Map();
  const key = (pk, sk) => `${pk}|${sk}`;
  items.set(key("EVENT#nerdearla-2026", "PROFILE#matias"), {
    pk: "EVENT#nerdearla-2026", sk: "PROFILE#matias", id: "matias", name: "Matías", role: "hero", consent: true
  });
  const originalSend = DynamoDBDocumentClient.prototype.send;
  DynamoDBDocumentClient.prototype.send = async (command) => {
    const input = command.input;
    if (command instanceof GetCommand) return { Item: items.get(key(input.Key.pk, input.Key.sk)) };
    if (command instanceof PutCommand) { items.set(key(input.Item.pk, input.Item.sk), input.Item); return {}; }
    if (command instanceof DeleteCommand) { items.delete(key(input.Key.pk, input.Key.sk)); return {}; }
    if (command instanceof QueryCommand) return { Items: [...items.values()].filter((item) =>
      item.pk === input.ExpressionAttributeValues[":pk"] && item.sk.startsWith(input.ExpressionAttributeValues[":prefix"])) };
    throw new Error(`Unexpected command: ${command.constructor.name}`);
  };
  try {
    const profiles = JSON.parse((await handler(request("GET", "/profiles"))).body).profiles;
    assert.ok(profiles.some((profile) => profile.id === "matias"));
    assert.ok(profiles.some((profile) => profile.id === "ana-cloud"));
    assert.equal((await handler(request("POST", "/admin/heroes/matias/link"))).statusCode, 401);
    const link = await handler(request("POST", "/admin/heroes/matias/link", "Bearer test-admin-token"));
    assert.equal(link.statusCode, 201);
    const token = JSON.parse(link.body).url.split("#")[1];
    assert.ok(token.startsWith("matias."));
    assert.equal((await handler(request("PUT", "/heroes/me/location", "Hero matias.invalid", { latitude: -34, longitude: -58, accuracy: 15 }))).statusCode, 401);
    assert.equal((await handler(request("PUT", "/heroes/me/location", `Hero ${token}`, { latitude: 190, longitude: -58, accuracy: 15 }))).statusCode, 422);
    assert.equal((await handler(request("PUT", "/heroes/me/location", `Hero ${token}`, { latitude: -34.6, longitude: -58.4, accuracy: 15 }))).statusCode, 200);
    const live = JSON.parse((await handler(request("GET", "/heroes/live"))).body).heroes;
    assert.equal(live.length, 1);
    assert.equal(live[0].name, "Matías");
    assert.ok(!JSON.stringify(live).includes(token));
    assert.equal((await handler(request("DELETE", "/heroes/me/location", `Hero ${token}`))).statusCode, 200);
    assert.equal(JSON.parse((await handler(request("GET", "/heroes/live"))).body).heroes.length, 0);
    await handler(request("POST", "/admin/heroes/matias/link", "Bearer test-admin-token"));
    assert.equal((await handler(request("GET", "/heroes/me", `Hero ${token}`))).statusCode, 401);
  } finally {
    DynamoDBDocumentClient.prototype.send = originalSend;
  }
});
