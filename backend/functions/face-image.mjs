import { createHash } from "node:crypto";

const maxImageBytes = 5 * 1024 * 1024;

export function imageBytes(dataUrl) {
  if (typeof dataUrl !== "string") throw new Error("invalid_image");
  const match = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) throw new Error("invalid_image");
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > maxImageBytes) throw new Error(bytes.length ? "image_too_large" : "invalid_image");
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if ((match[1] === "jpeg" && !jpeg) || (match[1] === "png" && !png)) throw new Error("invalid_image");
  return bytes;
}

export function rekognitionUserId(eventId, profileId) {
  return `P_${createHash("sha256").update(`${eventId}:${profileId}`).digest("hex").slice(0, 40)}`;
}
