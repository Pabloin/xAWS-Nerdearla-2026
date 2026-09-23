import assert from "node:assert/strict";
import test from "node:test";

process.env.ADMIN_TOKEN = "test-admin-token";
const { handler } = await import("../functions/api.mjs");

function request(authorization) {
  return {
    rawPath: "/admin/session",
    requestContext: { http: { method: "GET" } },
    headers: authorization ? { authorization } : {}
  };
}

test("admin session rejects missing and incorrect bearer tokens", async () => {
  assert.equal((await handler(request())).statusCode, 401);
  assert.equal((await handler(request("Bearer wrong-token"))).statusCode, 401);
});

test("admin session accepts the configured bearer token", async () => {
  const response = await handler(request("Bearer test-admin-token"));
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).authorized, true);
});
