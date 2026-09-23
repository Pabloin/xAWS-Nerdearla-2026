import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import QRCode from "qrcode";
import { demoProfiles } from "./demo-profiles.mjs";
import { encounterKeys, normalizeProfile, publicProfileUrl } from "./domain.mjs";

const tableName = process.env.TABLE_NAME || "comunid-local";
const publicAppUrl = process.env.PUBLIC_APP_URL || "https://comunid.app";
const defaultEventId = process.env.DEFAULT_EVENT_ID || "nerdearla-2026";
const adminToken = process.env.ADMIN_TOKEN || "";
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || "http://127.0.0.1:5190,https://comunid.app").split(",").map((origin) => origin.trim()));
const database = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function headers(event, contentType = "application/json") {
  const origin = event?.headers?.origin;
  return {
    "content-type": contentType,
    "access-control-allow-origin": allowedOrigins.has(origin) ? origin : publicAppUrl,
    "access-control-allow-headers": "content-type,authorization",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    vary: "origin"
  };
}

function json(event, statusCode, value) {
  return { statusCode, headers: headers(event), body: JSON.stringify(value) };
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    throw new Error("invalid_json");
  }
}

function routeParts(event) {
  return String(event.rawPath || "/").split("/").filter(Boolean).map(decodeURIComponent);
}

function profileFromItem(item) {
  const { pk, sk, entityType, eventId, createdAt, updatedAt, ...profile } = item;
  return profile;
}

async function listProfiles(event) {
  const result = await database.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
    ExpressionAttributeValues: { ":pk": `EVENT#${defaultEventId}`, ":prefix": "PROFILE#" }
  }));
  const profiles = (result.Items || []).filter((item) => item.consent === true).map(profileFromItem);
  return json(event, 200, { eventId: defaultEventId, profiles: profiles.length ? profiles : demoProfiles });
}

async function getProfile(event, profileId) {
  const result = await database.send(new GetCommand({
    TableName: tableName,
    Key: { pk: `EVENT#${defaultEventId}`, sk: `PROFILE#${profileId}` }
  }));
  const item = result.Item || demoProfiles.find((profile) => profile.id === profileId);
  if (!item || item.consent === false) return json(event, 404, { error: "profile_not_found" });
  return json(event, 200, { ...profileFromItem(item), qrPayload: publicProfileUrl(publicAppUrl, profileId) });
}

async function profileExists(profileId) {
  if (demoProfiles.some((profile) => profile.id === profileId && profile.consent)) return true;
  const result = await database.send(new GetCommand({
    TableName: tableName,
    Key: { pk: `EVENT#${defaultEventId}`, sk: `PROFILE#${profileId}` }
  }));
  return result.Item?.consent === true;
}

async function createProfile(event) {
  if (!adminToken || event.headers?.authorization !== `Bearer ${adminToken}`) {
    return json(event, 401, { error: "admin_authorization_required" });
  }
  const profile = normalizeProfile(parseBody(event));
  if (!profile.consent) return json(event, 422, { error: "profile_consent_required" });
  const timestamp = new Date().toISOString();
  await database.send(new PutCommand({
    TableName: tableName,
    Item: { pk: `EVENT#${defaultEventId}`, sk: `PROFILE#${profile.id}`, entityType: "PROFILE", eventId: defaultEventId, ...profile, createdAt: timestamp, updatedAt: timestamp },
    ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)"
  }));
  return json(event, 201, { ...profile, qrPayload: publicProfileUrl(publicAppUrl, profile.id) });
}

async function createEncounter(event) {
  const input = parseBody(event);
  const keys = encounterKeys({ eventId: input.eventId || defaultEventId, playerId: input.playerId, profileId: input.profileId });
  if (!(await profileExists(keys.profileId))) return json(event, 404, { error: "profile_not_found" });
  const timestamp = new Date().toISOString();
  await database.send(new PutCommand({
    TableName: tableName,
    Item: { ...keys, entityType: "ENCOUNTER", collectedAt: timestamp },
    ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)"
  })).catch((error) => {
    if (error.name !== "ConditionalCheckFailedException") throw error;
  });
  return json(event, 201, { ...keys, collectedAt: timestamp });
}

async function listEncounters(event, playerId) {
  const result = await database.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
    ExpressionAttributeValues: { ":pk": `PLAYER#${playerId}`, ":prefix": `ENCOUNTER#${defaultEventId}#` }
  }));
  return json(event, 200, { playerId, eventId: defaultEventId, encounters: result.Items || [] });
}

async function profileQr(event, profileId) {
  const svg = await QRCode.toString(publicProfileUrl(publicAppUrl, profileId), {
    type: "svg",
    width: 320,
    margin: 1,
    color: { dark: "#101218", light: "#FFFFFF" }
  });
  return { statusCode: 200, headers: { ...headers(event, "image/svg+xml"), "cache-control": "public,max-age=3600" }, body: svg };
}

export async function handler(event) {
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === "OPTIONS") return { statusCode: 204, headers: headers(event), body: "" };
  const parts = routeParts(event);

  try {
    if (method === "GET" && parts[0] === "health") return json(event, 200, { service: "comunid-api", status: "ok", eventId: defaultEventId });
    if (method === "GET" && parts[0] === "profiles" && !parts[1]) return listProfiles(event);
    if (method === "POST" && parts[0] === "profiles" && !parts[1]) return createProfile(event);
    if (method === "GET" && parts[0] === "profiles" && parts[1] && parts[2] === "qr") return profileQr(event, parts[1]);
    if (method === "GET" && parts[0] === "profiles" && parts[1]) return getProfile(event, parts[1]);
    if (method === "POST" && parts[0] === "encounters") return createEncounter(event);
    if (method === "GET" && parts[0] === "players" && parts[1] && parts[2] === "encounters") return listEncounters(event, parts[1]);
    return json(event, 404, { error: "not_found" });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "unexpected_error";
    const clientError = ["invalid_json", "invalid_profile_role", "profile_name_required", "encounter_fields_required"].includes(message);
    return json(event, clientError ? 400 : 500, { error: message });
  }
}
