import assert from "node:assert/strict";
import test from "node:test";

const { handler } = await import("../functions/api.mjs");

function request(method, path, claims, body) {
  return {
    rawPath: path,
    requestContext: {
      http: { method },
      authorizer: claims ? { jwt: { claims } } : undefined
    },
    headers: {},
    body: body ? JSON.stringify(body) : undefined
  };
}

test("encounter creation requires a Cognito access token even with a spoofed playerId", async () => {
  const response = await handler(request("POST", "/encounters", null, {
    playerId: "someone-else", profileId: "ana-cloud"
  }));
  assert.equal(response.statusCode, 401);
  assert.equal(JSON.parse(response.body).error, "authentication_required");
});

test("ID tokens cannot be used for attendee API calls", async () => {
  const response = await handler(request("GET", "/me/encounters", { sub: "alice", token_use: "id" }));
  assert.equal(response.statusCode, 401);
});

test("one attendee cannot list another attendee's encounters", async () => {
  const response = await handler(request("GET", "/players/bob/encounters", { sub: "alice", token_use: "access" }));
  assert.equal(response.statusCode, 403);
  assert.equal(JSON.parse(response.body).error, "forbidden");
});
