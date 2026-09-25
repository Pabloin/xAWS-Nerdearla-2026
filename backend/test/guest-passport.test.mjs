import assert from "node:assert/strict";
import test from "node:test";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { handler } from "../functions/api.mjs";

function request(method, path, token, body) {
  return {
    rawPath: path,
    requestContext: { http: { method } },
    headers: token ? { authorization: `Guest ${token}` } : {},
    body: body ? JSON.stringify(body) : undefined
  };
}

test("a guest can earn five encounters and opt in to contact without registering", async () => {
  const items = new Map();
  const originalSend = DynamoDBDocumentClient.prototype.send;
  DynamoDBDocumentClient.prototype.send = async (command) => {
    const input = command.input;
    if (command instanceof PutCommand) {
      const item = input.Item;
      const key = `${item.pk}|${item.sk}`;
      if (items.has(key)) {
        const error = new Error("duplicate");
        error.name = "ConditionalCheckFailedException";
        throw error;
      }
      items.set(key, item);
      return {};
    }
    if (command instanceof GetCommand) {
      return { Item: items.get(`${input.Key.pk}|${input.Key.sk}`) };
    }
    if (command instanceof QueryCommand) {
      return { Items: [...items.values()].filter((item) =>
        item.pk === input.ExpressionAttributeValues[":pk"] &&
        item.sk.startsWith(input.ExpressionAttributeValues[":prefix"])
      ) };
    }
    if (command instanceof UpdateCommand) {
      const key = `${input.Key.pk}|${input.Key.sk}`;
      const item = { ...items.get(key) };
      if (input.UpdateExpression.startsWith("REMOVE")) delete item.email;
      else item.email = input.ExpressionAttributeValues[":email"];
      item.contactConsent = input.ExpressionAttributeValues[":consent"];
      items.set(key, item);
      return { Attributes: item };
    }
    throw new Error(`Unexpected command: ${command.constructor.name}`);
  };

  try {
    const invalid = await handler(request("POST", "/guests", null, { name: "A" }));
    assert.equal(invalid.statusCode, 422);

    const created = await handler(request("POST", "/guests", null, { name: "  Sol   Pérez  " }));
    assert.equal(created.statusCode, 201);
    const { guest, token } = JSON.parse(created.body);
    assert.equal(guest.name, "Sol Pérez");
    assert.equal(guest.email, null);
    assert.ok(token.startsWith(`${guest.id}.`));
    assert.ok(!created.body.includes("tokenHash"));

    const rejected = await handler(request("GET", "/guests/me", `${guest.id}.${"A".repeat(43)}`));
    assert.equal(rejected.statusCode, 401);

    const earlyContact = await handler(request("PUT", "/guests/me/contact", token, {
      email: "sol@example.com", consent: true
    }));
    assert.equal(earlyContact.statusCode, 403);

    for (const profileId of ["ana-cloud", "mati-open", "luz-student", "nico-connects", "vero-legend"]) {
      const response = await handler(request("POST", "/guests/me/encounters", token, { profileId }));
      assert.equal(response.statusCode, 201);
    }
    await handler(request("POST", "/guests/me/encounters", token, { profileId: "ana-cloud" }));
    const listed = await handler(request("GET", "/guests/me/encounters", token));
    assert.equal(JSON.parse(listed.body).encounters.length, 5);

    const second = JSON.parse((await handler(request("POST", "/guests", null, { name: "Luna" }))).body);
    const secondPassport = await handler(request("GET", "/guests/me/encounters", second.token));
    assert.equal(JSON.parse(secondPassport.body).encounters.length, 0);
    const secondContact = await handler(request("PUT", "/guests/me/contact", second.token, {
      email: "luna@example.com", consent: true
    }));
    assert.equal(secondContact.statusCode, 403);

    const missingConsent = await handler(request("PUT", "/guests/me/contact", token, {
      email: "sol@example.com"
    }));
    assert.equal(missingConsent.statusCode, 422);
    const contacted = await handler(request("PUT", "/guests/me/contact", token, {
      email: " Sol@Example.com ", consent: true
    }));
    assert.equal(contacted.statusCode, 200);
    assert.equal(JSON.parse(contacted.body).guest.email, "sol@example.com");

    const removed = await handler(request("DELETE", "/guests/me/contact", token));
    assert.equal(removed.statusCode, 200);
    assert.equal(JSON.parse(removed.body).guest.email, null);
    assert.equal(JSON.parse(removed.body).guest.contactConsent, false);
    const stillPlayable = await handler(request("GET", "/guests/me/encounters", token));
    assert.equal(JSON.parse(stillPlayable.body).encounters.length, 5);
  } finally {
    DynamoDBDocumentClient.prototype.send = originalSend;
  }
});
