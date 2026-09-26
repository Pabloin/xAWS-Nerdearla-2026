import "./hero.css";

const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const tokenKey = "comunid:hero-access";
const profileKey = "comunid:hero-profile";
const registration = document.querySelector("#registration");
const nameInput = document.querySelector("#name");
const communityInput = document.querySelector("#community");
const roleInput = document.querySelector("#role");
const photoInput = document.querySelector("#photo");
const photoPreview = document.querySelector("#photo-preview");
const cameraButton = document.querySelector("#camera-button");
const cameraPreview = document.querySelector("#camera-preview");
const capturePhoto = document.querySelector("#capture-photo");
const joinButton = document.querySelector("#join");
const qr = document.querySelector("#hero-qr");
const status = document.querySelector("#status");
const start = document.querySelector("#start");
const stop = document.querySelector("#stop");
const map = document.querySelector("#hero-map");
const mapFrame = document.querySelector("#map-frame");
const mapAccuracy = document.querySelector("#map-accuracy");
let token = sessionStorage.getItem(tokenKey) || "";
let profileId = sessionStorage.getItem(profileKey) || "";
let profileName = "";
let watchId = null;
let heartbeat = null;
let lastSent = 0;
let sending = false;
let pendingPublish = null;
let photoDataUrl = "";
let cameraStream = null;

function message(text, error = false) {
  status.textContent = text;
  status.classList.toggle("error", error);
}

function showProfile(profile) {
  profileId = profile.profileId || profile.id;
  profileName = profile.name;
  registration.hidden = true;
  qr.hidden = false;
  document.querySelector("#qr-name").textContent = profile.name;
  document.querySelector("#qr-community").textContent = profile.community || "";
  const qrPhoto = document.querySelector("#qr-photo");
  if (photoDataUrl) {
    qrPhoto.src = photoDataUrl;
    qrPhoto.hidden = false;
  } else if (profileId.startsWith("member-")) {
    qrPhoto.src = apiBase + "/profiles/" + profileId + "/photo";
    qrPhoto.hidden = false;
  } else {
    qrPhoto.hidden = true;
  }
  document.querySelector("#qr-image").src = apiBase + "/profiles/" + profileId + "/qr";
  document.querySelector("#qr-image").alt = "QR de " + profile.name;
  start.hidden = false;
  message("Tu perfil está listo. La ubicación está apagada.");
}

async function imageAsDataUrl(file) {
  const image = await createImageBitmap(file);
  const scale = Math.min(1, 640 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

function stopCamera() {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  cameraPreview.srcObject = null;
  cameraPreview.hidden = true;
  capturePhoto.hidden = true;
  cameraButton.textContent = photoDataUrl ? "Volver a sacar la foto" : "Sacar una foto";
}

cameraButton.addEventListener("click", async () => {
  if (cameraStream) {
    stopCamera();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    message("Este navegador no permite abrir la cámara. Elegí una foto de tu dispositivo.", true);
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    cameraPreview.srcObject = cameraStream;
    cameraPreview.hidden = false;
    photoPreview.hidden = true;
    capturePhoto.hidden = false;
    cameraButton.textContent = "Cancelar cámara";
    await cameraPreview.play();
  } catch {
    stopCamera();
    message("No pudimos abrir la cámara. Revisá el permiso del navegador o elegí una foto.", true);
  }
});

capturePhoto.addEventListener("click", () => {
  if (!cameraPreview.videoWidth || !cameraPreview.videoHeight) {
    message("La cámara todavía se está iniciando. Probá de nuevo en un instante.", true);
    return;
  }
  const scale = Math.min(1, 640 / Math.max(cameraPreview.videoWidth, cameraPreview.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(cameraPreview.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(cameraPreview.videoHeight * scale));
  canvas.getContext("2d").drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);
  photoDataUrl = canvas.toDataURL("image/jpeg", 0.72);
  photoPreview.src = photoDataUrl;
  photoPreview.hidden = false;
  stopCamera();
  message("Foto lista. Se publicará junto con tu perfil.");
});

photoInput.addEventListener("change", async () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  try {
    stopCamera();
    photoDataUrl = await imageAsDataUrl(file);
    photoPreview.src = photoDataUrl;
    photoPreview.hidden = false;
    cameraButton.textContent = "Volver a sacar la foto";
    message("Foto lista. Se publicará junto con tu perfil.");
  } catch {
    message("No pudimos leer esa foto. Probá con otra imagen.", true);
  }
});

window.addEventListener("pagehide", stopCamera);

registration.addEventListener("submit", async (event) => {
  event.preventDefault();
  stopCamera();
  joinButton.disabled = true;
  message("Creando tu perfil…");
  try {
    const response = await fetch(apiBase + "/community/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: nameInput.value.trim(), role: roleInput.value, community: communityInput.value, photoDataUrl }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errors = { community_invalid: "Elegí una comunidad de la lista.", community_role_invalid: "Elegí cómo te sumás a la comunidad.", community_name_invalid: "Escribí tu nombre para crear el perfil.", photo_invalid: "La foto no es válida; probá con otra imagen." };
      throw new Error(errors[result.error] || "No pudimos crear tu perfil.");
    }
    token = result.token;
    profileId = result.profileId;
    profileName = result.name;
    sessionStorage.setItem(tokenKey, token);
    sessionStorage.setItem(profileKey, profileId);
    showProfile(result);
  } catch (error) {
    message(error instanceof Error ? error.message : "No pudimos crear tu perfil. Revisá la conexión.", true);
  } finally {
    joinButton.disabled = false;
  }
});

async function request(path, options = {}) {
  const response = await fetch(apiBase + path, {
    ...options,
    headers: { authorization: "Hero " + token, "x-hero-profile-id": profileId,
      ...(options.body ? { "content-type": "application/json" } : {}) },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "HTTP " + response.status);
  return result;
}

function showPublishedPosition(latitude, longitude, accuracy) {
  const latSpan = 0.0025;
  const lonSpan = latSpan / Math.max(Math.cos(latitude * Math.PI / 180), 0.2);
  const query = new URLSearchParams({
    bbox: [longitude - lonSpan, latitude - latSpan, longitude + lonSpan, latitude + latSpan].join(","),
    layer: "mapnik",
    marker: latitude + "," + longitude,
  });
  mapFrame.src = "https://www.openstreetmap.org/export/embed.html?" + query;
  mapAccuracy.textContent = "Precisión aproximada ±" + Math.round(accuracy) + " m";
  map.hidden = false;
}

function readPosition() {
  navigator.geolocation.getCurrentPosition(publish, () =>
    message("No pudimos obtener tu ubicación. Revisá el permiso del navegador.", true),
  { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 });
}

async function publish(position) {
  if (watchId === null || sending || Date.now() - lastSent < 15000) return;
  sending = true;
  try {
    const { latitude, longitude, accuracy } = position.coords;
    pendingPublish = request("/heroes/me/location", {
      method: "PUT",
      body: JSON.stringify({ latitude, longitude, accuracy }),
    });
    await pendingPublish;
    lastSent = Date.now();
    if (watchId !== null) showPublishedPosition(latitude, longitude, accuracy);
    message("Compartiendo ubicación · precisión aproximada " + Math.round(accuracy) + " m · " + profileName);
  } catch {
    message("No pudimos actualizar tu ubicación. Revisá la conexión.", true);
  } finally {
    pendingPublish = null;
    sending = false;
  }
}

start.addEventListener("click", () => {
  if (!navigator.geolocation) return message("Este navegador no permite compartir ubicación.", true);
  message("Pidiendo permiso de ubicación…");
  watchId = navigator.geolocation.watchPosition(publish, () =>
    message("No pudimos obtener tu ubicación. Revisá el permiso del navegador.", true),
  { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 });
  heartbeat = setInterval(readPosition, 30000);
  start.hidden = true;
  stop.hidden = false;
});

stop.addEventListener("click", async () => {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  clearInterval(heartbeat);
  stop.disabled = true;
  try {
    if (pendingPublish) await pendingPublish.catch(() => undefined);
    await request("/heroes/me/location", { method: "DELETE" });
    map.hidden = true;
    mapFrame.removeAttribute("src");
    message("Dejaste de compartir tu ubicación. Tu perfil sigue visible.");
    start.hidden = false;
    stop.hidden = true;
  } catch {
    message("No pudimos detener la ubicación en el servidor. Si no hay actualizaciones, desaparecerá en 2 minutos.", true);
  } finally {
    stop.disabled = false;
  }
});

// Compatibility with private links already issued to existing Heroes.
const fragment = decodeURIComponent(location.hash.slice(1));
if (fragment && !profileId) {
  history.replaceState(null, "", location.pathname);
  token = fragment;
  profileId = fragment.includes(".") ? fragment.split(".")[0] : "";
  sessionStorage.setItem(tokenKey, token);
  sessionStorage.setItem(profileKey, profileId);
  request("/heroes/me").then((result) => showProfile(result))
    .catch(() => message("No pudimos validar tu enlace. Pedí uno nuevo a la organización.", true));
} else if (token && profileId) {
  request("/heroes/me").then((result) => showProfile(result))
    .catch(() => {
      sessionStorage.removeItem(tokenKey);
      sessionStorage.removeItem(profileKey);
      message("Completá tus datos para crear tu perfil.");
    });
}
