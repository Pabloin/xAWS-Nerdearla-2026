import assert from "node:assert/strict";
import test from "node:test";
import { encounterKeys, normalizeProfile, publicProfileUrl } from "../functions/domain.mjs";

test("normalizes a consented community profile", () => {
  const result = normalizeProfile({ id: "ana", name: " Ana Silva ", role: "BUILDER", consent: true, color: "#c8ff3d" });
  assert.equal(result.name, "Ana Silva");
  assert.equal(result.role, "builder");
  assert.equal(result.color, "#C8FF3D");
  assert.equal(result.faceConsent, false);
  assert.equal(normalizeProfile({ name: "Ana", role: "builder", consent: true, faceConsent: true }).faceConsent, true);
});

test("rejects unknown roles", () => {
  assert.throws(() => normalizeProfile({ name: "Ana", role: "wizard" }), /invalid_profile_role/);
});

test("encounter keys are deterministic and idempotent", () => {
  assert.deepEqual(encounterKeys({ eventId: "n26", playerId: "p1", profileId: "ana" }), {
    pk: "PLAYER#p1",
    sk: "ENCOUNTER#n26#ana",
    eventId: "n26",
    playerId: "p1",
    profileId: "ana"
  });
});

test("builds stable public profile URLs", () => {
  assert.equal(publicProfileUrl("https://comunid.app/", "ana cloud"), "https://comunid.app/b/ana%20cloud");
});
