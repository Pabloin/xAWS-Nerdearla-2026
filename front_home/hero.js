import "./hero.css";

const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const tokenKey = "comunid:hero-access";
const hashToken = decodeURIComponent(location.hash.slice(1));
if (hashToken) {
  sessionStorage.setItem(tokenKey, hashToken);
  history.replaceState(null, "", location.pathname);
}
const token = sessionStorage.getItem(tokenKey) || "";
const status = document.querySelector("#status");
const start = document.querySelector("#start");
const stop = document.querySelector("#stop");
let watchId = null;
let heartbeat = null;
let lastSent = 0;
let sending = false;

function message(text, error = false) {
  status.textContent = text;
  status.classList.toggle("error", error);
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

start.addEventListener("click", () => {
  if (!navigator.geolocation) return message("Este navegador no permite compartir ubicación.", true);
  message("Pidiendo permiso de ubicación…");
  watchId = navigator.geolocation.watchPosition(publish, () => message("No pudimos obtener tu ubicación. Revisá el permiso del navegador.", true),
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
    await request("/heroes/me/location", { method: "DELETE" });
    message("Dejaste de compartir tu ubicación.");
    start.hidden = false;
    stop.hidden = true;
  } catch {
    message("No pudimos detener la ubicación en el servidor. Probá otra vez; si no hay actualizaciones desaparece en 2 minutos.", true);
  } finally {
    stop.disabled = false;
  }
});

if (!token || !apiBase) message("Abrí el enlace privado que te dio la organización.", true);
else request("/heroes/me").then(({ name }) => {
  document.querySelector("#hero-name").textContent = name;
  document.querySelector("#identity").hidden = false;
  document.querySelector("#intro").textContent = "Cuando actives la ubicación, las personas podrán encontrarte desde la app.";
  start.hidden = false;
  message("Ubicación apagada.");
}).catch(() => {
  sessionStorage.removeItem(tokenKey);
  message("El enlace ya no es válido. Pedí uno nuevo a la organización.", true);
});
