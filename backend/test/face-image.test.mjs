import assert from "node:assert/strict";
import test from "node:test";
import { imageBytes, rekognitionUserId } from "../functions/face-image.mjs";

test("accepts a JPEG data URL and rejects images with a mismatched signature", () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
  assert.deepEqual(imageBytes(`data:image/jpeg;base64,${jpeg.toString("base64")}`), jpeg);
  assert.throws(() => imageBytes(`data:image/png;base64,${jpeg.toString("base64")}`), /invalid_image/);
});

test("rejects oversized uploads before calling Rekognition", () => {
  const oversized = Buffer.alloc(5 * 1024 * 1024 + 1);
  assert.throws(() => imageBytes(`data:image/jpeg;base64,${oversized.toString("base64")}`), /image_too_large/);
});

test("uses stable event-specific Rekognition user IDs", () => {
  assert.equal(rekognitionUserId("nerdearla-2026", "ana"), rekognitionUserId("nerdearla-2026", "ana"));
  assert.notEqual(rekognitionUserId("nerdearla-2026", "ana"), rekognitionUserId("other-event", "ana"));
  assert.match(rekognitionUserId("nerdearla-2026", "ana"), /^P_[a-f0-9]{40}$/);
});
