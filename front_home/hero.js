import "./hero.css";

const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const tokenKey = "comunid:hero-access";
const heroes = new Map([
  ["matias-kreder", "Matias Kreder"],
  ["rossana-suarez", "Rossana Suarez (Roxs)"],
  ["ricardo-ceci", "Ricardo Ceci"],
  ["damian-olguin", "Damian Olguin"],
]);
const select = document.querySelector("#hero-select");
const qr = document.querySelector("#hero-qr");
const status = document.querySelector("#status");
const start = document.querySelector("#start");
const stop = document.querySelector("#stop");
const access = document.querySelector("#access");
const code = document.querySelector("#hero-code");
let token = sessionStorage.getItem(tokenKey) || "";
let authorizedHeroId = "";
let watchId = null;
let heartbeat = null;
let lastSent = 0;
let sending = false;

function message(text, error = false) {
  status.textContent = text;
  status.classList.toggle("error", error);
}

function showSelectedHero() {
  const id = select.value;
  qr.hidden = !id;
  if (id) {
    document.querySelector("#hero-photo").src = `/app/heros/hero-${id}.png`;
    document.querySelector("#hero-photo").alt = `Foto de ${heroes.get(id)}`;
    document.querySelector("#qr-image").src = `${apiBase}/profiles/${id}/qr`;
    document.querySelector("#qr-image").alt = `QR de ${heroes.get(id)}`;
    document.querySelector("#qr-name").textContent = heroes.get(id);
  }
  const canShare = id && authorizedHeroId === id;
  start.hidden = !canShare || watchId !== null;
  access.hidden = !id || Boolean(canShare);
  if (!id) message("Elegí tu Hero para empezar.");
  else if (!canShare) message("Tu QR está listo. Para emitir ubicación, ingresá el código privado de este Hero.");
  else if (watchId === null) message("QR listo. La ubicación está apagada.");
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { authorization: `Hero ${token}`, ...(options.body ? { "content-type": "application/json" } : {}) }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
  return result;
}

async function authorize(candidate) {
  const entered = candidate.trim();
  token = entered.includes("#") ? entered.split("#").pop() : entered;
  try {
    const result = await request("/heroes/me");
    if (!heroes.has(result.profileId)) throw new Error("hero_not_in_event");
    authorizedHeroId = result.profileId;
    sessionStorage.setItem(tokenKey, token);
    select.value = result.profileId;
    code.value = "";
    showSelectedHero();
    message(`Acceso de ${heroes.get(result.profileId)} habilitado. La ubicación sigue apagada.`);
  } catch {
    token = "";
    authorizedHeroId = "";
    sessionStorage.removeItem(tokenKey);
    showSelectedHero();
    message("Ese código privado no es válido. Pedí uno nuevo a la organización.", true);
  }
}

async function publish(position) {
  if (watchId === null || sending || Date.now() - lastSent < 15000) return;
  sending = true;
  try {
    const { latitude, longitude, accuracy } = position.coords;
    await request("/heroes/me/location", { method: "PUT", body: JSON.stringify({ latitude, longitude, accuracy }) });
    lastSent = Date.now();
    message(`Compartiendo ubicación · precisión aproximada ${Math.round(accuracy)} m · actualizado ${new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`);
  } catch {
    message("No pudimos actualizar tu ubicación. Revisá la conexión.", true);
  } finally {
    sending = false;
  }
}

function readPosition() {
  navigator.geolocation.getCurrentPosition(publish, () => message("No pudimos obtener tu ubicación. Revisá el permiso del navegador.", true),
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 });
}

select.addEventListener("change", showSelectedHero);
document.querySelector("#connect").addEventListener("click", () => {
  const candidate = code.value.trim();
  if (!candidate) return message("Ingresá el código privado de este Hero.", true);
  void authorize(candidate);
});

start.addEventListener("click", () => {
  if (!navigator.geolocation) return message("Este navegador no permite compartir ubicación.", true);
  message("Pidiendo permiso de ubicación…");
  watchId = navigator.geolocation.watchPosition(publish, () => message("No pudimos obtener tu ubicación. Revisá el permiso del navegador.", true),
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 });
  heartbeat = setInterval(readPosition, 30000);
  select.disabled = true;
  start.hidden = true;
  stop.hidden = false;
});

stop.addEventListener("click", async () => {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  clearInterval(heartbeat);
  stop.disabled = true;
  try {
    await request("/heroes/me/location", { method: "DELETE" });
    message("Dejaste de compartir tu ubicación. El QR sigue disponible.");
    start.hidden = false;
    stop.hidden = true;
  } catch {
    message("No pudimos detener la ubicación en el servidor. Probá otra vez; si no hay actualizaciones desaparece en 2 minutos.", true);
  } finally {
    select.disabled = false;
    stop.disabled = false;
  }
});

const fragment = decodeURIComponent(location.hash.slice(1));
if (fragment) history.replaceState(null, "", location.pathname);
if (fragment) void authorize(fragment);
else if (token) void authorize(token);
else showSelectedHero();
