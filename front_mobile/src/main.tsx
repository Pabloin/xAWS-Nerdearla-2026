import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Compass,
  Gift,
  ImagePlus,
  LockKeyhole,
  Mail,
  MapPin,
  QrCode,
  ScanLine,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { demoProfiles, demoQuests } from "./demo-data";
import { AuthScreen } from "./AuthScreen";
import {
  accessToken,
  authEnabled,
  currentSession,
  logout,
  type AttendeeSession,
} from "./auth";
import {
  collectEncounter,
  profileIdFromQr,
  questProgress,
  roleLabels,
  type BuilderProfile,
  type Encounter,
} from "./domain";
import "./styles.css";

type View =
  | "welcome"
  | "login"
  | "discover"
  | "scan"
  | "selfie"
  | "success"
  | "passport";
const encounterKey = "comunid:encounters";
const startedKey = "comunid:started";
const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);
function readEncounters(): Encounter[] {
  try {
    const value = JSON.parse(localStorage.getItem(encounterKey) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function Avatar({
  profile,
  large = false,
}: {
  profile: BuilderProfile;
  large?: boolean;
}) {
  return (
    <span
      className={`avatar ${large ? "avatar-large" : ""}`}
      style={{ "--accent": profile.color } as React.CSSProperties}
    >
      {profile.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}
function Brand() {
  return (
    <span className="brand-wrap" aria-label="comunid.app">
      <span className="brand-icon">
        <img src="/brand/logo-comunid-app.png" alt="" />
      </span>
      <span className="brand-word">
        comunid<span>.app</span>
      </span>
    </span>
  );
}

function App() {
  const [view, setView] = useState<View>(() =>
    authEnabled
      ? "welcome"
      : localStorage.getItem(startedKey)
        ? "discover"
        : "welcome",
  );
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authReady, setAuthReady] = useState(!authEnabled);
  const [session, setSession] = useState<AttendeeSession | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [profiles, setProfiles] = useState<BuilderProfile[]>(demoProfiles);
  const [encounters, setEncounters] = useState<Encounter[]>(() =>
    authEnabled ? [] : readEncounters(),
  );
  const [pending, setPending] = useState<BuilderProfile | null>(null);
  const [selected, setSelected] = useState<BuilderProfile | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const deepLinkHandled = useRef(false);
  const collectedIds = useMemo(
    () => new Set(encounters.map((item) => item.builderId)),
    [encounters],
  );
  const collectedProfiles = profiles.filter((profile) =>
    collectedIds.has(profile.id),
  );
  useEffect(() => {
    if (!authEnabled)
      localStorage.setItem(encounterKey, JSON.stringify(encounters));
  }, [encounters]);
  useEffect(() => {
    if (!authEnabled) return;
    let active = true;
    currentSession()
      .then((current) => {
        if (!active) return;
        setSession(current);
        setView(current ? "discover" : "welcome");
        setAuthReady(true);
      })
      .catch(() => {
        if (active) {
          setAuthMessage("No pudimos verificar tu sesión.");
          setAuthReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!authEnabled || !session || !apiBaseUrl) return;
    let active = true;
    accessToken()
      .then((token) =>
        fetch(`${apiBaseUrl}/me/encounters`, {
          headers: { authorization: `Bearer ${token}` },
        }),
      )
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("No pudimos cargar tu pasaporte.")),
      )
      .then((data) => {
        if (!active) return;
        setEncounters(
          Array.isArray(data.encounters)
            ? data.encounters.map(
                (item: {
                  profileId: string;
                  collectedAt: string;
                  eventId: string;
                }) => ({
                  builderId: item.profileId,
                  collectedAt: item.collectedAt,
                  eventId: item.eventId,
                }),
              )
            : [],
        );
      })
      .catch(() => {
        if (active)
          setAuthMessage(
            "No pudimos cargar tu pasaporte. Recargá la página para volver a intentar.",
          );
      });
    return () => { active = false; };
  }, [session]);
  useEffect(() => {
    if (!apiBaseUrl) return;
    fetch(`${apiBaseUrl}/profiles`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data.profiles) && data.profiles.length)
          setProfiles(data.profiles);
      })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    if (deepLinkHandled.current || (authEnabled && !session)) return;
    const id = profileIdFromQr(window.location.href);
    const profile = profiles.find((item) => item.id === id);
    if (profile) {
      deepLinkHandled.current = true;
      setPending(profile);
      setView("selfie");
    }
  }, [profiles, session]);
  function stopCamera() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    frameRef.current = null;
    streamRef.current = null;
    setCameraOpen(false);
  }
  useEffect(() => stopCamera, []);
  function go(next: View) {
    stopCamera();
    setMessage("");
    setView(
      authEnabled && !session && next !== "welcome" && next !== "login"
        ? "login"
        : next,
    );
    window.scrollTo(0, 0);
  }
  function start() {
    if (authEnabled) {
      setAuthMode("signup");
      go("login");
    } else {
      localStorage.setItem(startedKey, "1");
      go("discover");
    }
  }
  async function authenticated() {
    const current = await currentSession();
    if (!current) {
      setAuthMessage("No pudimos iniciar tu sesión.");
      return;
    }
    setAuthMessage("");
    setSession(current);
    setView("discover");
    window.scrollTo(0, 0);
  }
  async function endSession() {
    try {
      await logout();
      setSession(null);
      setEncounters([]);
      go("welcome");
    } catch {
      setAuthMessage("No pudimos cerrar la sesión. Intentá de nuevo.");
    }
  }
  function badgeFound(payload: string) {
    const id = profileIdFromQr(payload);
    const profile = profiles.find((item) => item.id === id);
    if (!profile) throw new Error("Este badge no pertenece al evento actual.");
    stopCamera();
    setPending(profile);
    setSelfie(null);
    go("selfie");
  }
  function readFrame() {
    const video = videoRef.current,
      canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;
    if (
      video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA &&
      video.videoWidth
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(image.data, image.width, image.height, {
          inversionAttempts: "attemptBoth",
        });
        if (code?.data) {
          try {
            badgeFound(code.data);
            return;
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "No pudimos leer el QR.",
            );
          }
        }
      }
    }
    frameRef.current = requestAnimationFrame(readFrame);
  }
  async function openCamera(mode: "scan" | "selfie") {
    setMessage("Abriendo cámara…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode === "scan" ? "environment" : "user" },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(async () => {
        if (!videoRef.current || streamRef.current !== stream) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setMessage(
          mode === "scan"
            ? "Mantené el badge dentro del recuadro."
            : "Ubíquense los dos dentro del marco.",
        );
        if (mode === "scan")
          frameRef.current = requestAnimationFrame(readFrame);
      });
    } catch {
      setMessage(
        "No pudimos acceder a la cámara. Podés continuar sin foto o usar un badge de prueba.",
      );
    }
  }
  function captureSelfie() {
    const video = videoRef.current,
      canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setSelfie(canvas.toDataURL("image/jpeg", 0.82));
    stopCamera();
  }
  async function finishEncounter() {
    if (!pending) return;
    try {
      if (authEnabled) {
        if (!apiBaseUrl) throw new Error("La API no está configurada.");
        const token = await accessToken();
        const response = await fetch(`${apiBaseUrl}/encounters`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profileId: pending.id }),
        });
        if (!response.ok)
          throw new Error(
            "Encontramos el badge, pero no pudimos guardar el encuentro. Probá de nuevo.",
          );
      }
      setEncounters((current) => collectEncounter(current, pending.id));
      go("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el encuentro.",
      );
    }
  }
  const inApp = view !== "welcome" && view !== "login";
  if (!authReady)
    return (
      <div className="app-shell auth-loading" role="status">
        Cargando tu pasaporte…
      </div>
    );
  return (
    <div className="app-shell">
      {view === "welcome" && (
        <main className="intro-screen">
          <div className="intro-top">
            <Brand />
            <span className="event-pill">
              <MapPin size={14} /> Nerdearla 2026
            </span>
          </div>
          <div className="intro-art" aria-hidden="true">
            <div className="art-orbit" />
            <div className="art-book">
              <div className="art-page">
                <span className="art-logo">
                  ✦<br />
                  ●●●
                </span>
                <small>comunid.app</small>
                <i>PASAPORTE DE ENCUENTROS</i>
              </div>
              <div className="art-page art-stamps">
                <span>
                  ✦<br />
                  HERO
                </span>
                <span>
                  ✧<br />
                  BUILDER
                </span>
                <span>
                  ✦<br />
                  COMMUNITY
                </span>
                <span>＋</span>
              </div>
            </div>
          </div>
          <div className="intro-copy">
            <h1>
              Tu comunidad,
              <br />
              <em>una aventura.</em>
            </h1>
            <p>Conocé personas, guardá encuentros y completá tu pasaporte.</p>
            <button className="primary-button" type="button" onClick={start}>
              Empezar <ChevronRight size={20} />
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setAuthMode("login");
                go("login");
              }}
            >
              Ya tengo cuenta <ChevronRight size={17} />
            </button>
          </div>
        </main>
      )}
      {view === "login" &&
        (authEnabled ? (
          <AuthScreen
            key={authMode}
            brand={<Brand />}
            initialMode={authMode}
            onBack={() => go("welcome")}
            onAuthenticated={() => void authenticated()}
          />
        ) : (
          <main className="login-screen">
            <button
              className="icon-button login-back"
              type="button"
              onClick={() => go("welcome")}
              aria-label="Volver"
            >
              <ArrowLeft size={22} />
            </button>
            <Brand />
            <div className="login-hero">
              <span className="login-mark">
                ✦<br />
                ●●●
              </span>
              <h1>
                Volvé a tu
                <br />
                <em>comunidad</em>
              </h1>
              <p>Ingresá para continuar tu pasaporte.</p>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (email.trim()) start();
              }}
            >
              <label htmlFor="login-email">Correo electrónico</label>
              <div className="input-wrap">
                <Mail size={20} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <p className="demo-note">
                Vista de demo: tu progreso se guarda en este dispositivo.
              </p>
              <button className="primary-button" type="submit">
                Continuar en demo <ChevronRight size={20} />
              </button>
            </form>
            <button className="text-button" type="button" onClick={start}>
              Explorar sin correo <ChevronRight size={17} />
            </button>
          </main>
        ))}
      {authMessage && (
        <div className="global-message" role="alert">
          {authMessage}
        </div>
      )}
      {inApp && (
        <header
          className={`topbar ${view === "success" ? "topbar-light" : ""}`}
        >
          {view === "scan" || view === "selfie" ? (
            <button
              className="icon-button"
              type="button"
              onClick={() => go(view === "selfie" ? "scan" : "discover")}
              aria-label="Volver"
            >
              <ArrowLeft size={20} />
            </button>
          ) : null}
          <button
            className="brand-button"
            onClick={() => go("discover")}
            type="button"
          >
            <Brand />
          </button>
          {view === "scan" || view === "selfie" ? (
            <span className="icon-button top-action">
              <Camera size={20} />
            </span>
          ) : (
            <span className="event-pill">
              <MapPin size={13} /> Nerdearla 2026
            </span>
          )}
        </header>
      )}
      {view === "discover" && (
        <main className="page discover-page">
          <span className="eyebrow">LA COMUNIDAD EN VIVO</span>
          <h1>
            Explorá <em>el evento</em>
          </h1>
          <p className="page-subtitle">
            Encontrá personas en el evento, escaneá sus badges y completá tu
            pasaporte.
          </p>
          <button
            className="mission-card"
            type="button"
            onClick={() => go("passport")}
          >
            <span className="mission-icon">
              <Trophy size={25} />
            </span>
            <span>
              <small>MISIÓN ACTIVA</small>
              <strong>{demoQuests[1].title}</strong>
            </span>
            <b>{questProgress(demoQuests[1], profiles, encounters)}/2</b>
            <ChevronRight size={18} />
          </button>
          <div
            className="event-map"
            aria-label="Mapa ilustrativo de personas para conocer"
          >
            <div className="map-grid" />
            <span className="map-demo">MAPA ILUSTRATIVO</span>
            <span className="map-zone zone-one">ESCENARIO</span>
            <span className="map-zone zone-two">ZONA NETWORKING</span>
            <span className="map-zone zone-three">EXPOSITORES</span>
            <span className="map-pulse" />
            {profiles.slice(0, 3).map((profile, i) => (
              <button
                key={profile.id}
                className={`map-person map-person-${i}`}
                type="button"
                onClick={() => setSelected(profile)}
              >
                <Avatar profile={profile} />
                <span>
                  {profile.name.split(" ")[0]}
                  <small>{roleLabels[profile.role]}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="nearby-card">
            <Avatar profile={profiles[0]} />
            <span>
              <strong>
                {profiles[0].name} · <em>{roleLabels[profiles[0].role]}</em>
              </strong>
              <small>{profiles[0].community}</small>
              <span className="tag-list">
                <i>Builder</i>
                <i>IA</i>
                <i>Comunidad</i>
              </span>
            </span>
            <button type="button" onClick={() => setSelected(profiles[0])}>
              Ver encuentro
            </button>
          </div>
          <section className="below-map">
            <h2>Personas por descubrir</h2>
            <div className="people-row">
              {profiles.slice(1).map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelected(profile)}
                >
                  <Avatar profile={profile} />
                  <strong>{profile.name}</strong>
                  <small>{roleLabels[profile.role]}</small>
                </button>
              ))}
            </div>
          </section>
        </main>
      )}
      {view === "passport" && (
        <main className="page passport-page">
          <div className="page-center">
            <h1>Mi pasaporte</h1>
            <h2>Nerdearla 2026</h2>
            <p>Coleccioná encuentros. Conectá con la comunidad.</p>
          </div>
          <div className="passport-ticket">
            <div className="ticket-brand">
              <Brand />
              <small>
                EVENTO
                <br />
                <b>Nerdearla 2026</b>
              </small>
              <small>
                AÑO
                <br />
                <b>2026</b>
              </small>
            </div>
            <span className="ticket-portrait">
              <Users size={54} />
            </span>
            <div className="ticket-progress">
              <strong>
                {collectedProfiles.length} de {profiles.length} encuentros
              </strong>
              <div className="segments">
                {profiles.map((profile) => (
                  <i
                    key={profile.id}
                    className={collectedIds.has(profile.id) ? "filled" : ""}
                  />
                ))}
              </div>
            </div>
            <span className="ticket-stamp">
              COMUNIDAD
              <br />
              CONECTA
              <br />
              EXPLORA
            </span>
          </div>
          <div className="badge-grid">
            {(
              [
                "hero",
                "builder",
                "community",
                "student",
                "connector",
                "legend",
                "innovator",
                "creator",
              ] as const
            ).map((role) => {
              const found =
                role === "community"
                  ? collectedProfiles.length >= 3
                  : collectedProfiles.some((profile) => profile.role === role);
              return (
                <div
                  className={found ? "badge-item earned" : "badge-item"}
                  key={role}
                >
                  <span className="hex-badge">
                    {found ? <Users size={30} /> : <LockKeyhole size={24} />}
                  </span>
                  <strong>
                    {role === "community"
                      ? "Community"
                      : role[0].toUpperCase() + role.slice(1)}
                  </strong>
                  <small>{found ? "1/1" : "0/1"}</small>
                </div>
              );
            })}
          </div>
          <div className="reward-card">
            <Gift size={36} />
            <span>
              <small>PRÓXIMO PREMIO</small>
              <strong>
                {Math.max(0, 5 - collectedProfiles.length)
                  ? `${5 - collectedProfiles.length} encuentros`
                  : "¡Desbloqueado!"}
              </strong>
              <small>Seguí explorando para desbloquearlo.</small>
            </span>
            <ChevronRight size={20} />
          </div>
          {collectedProfiles.length > 0 && (
            <section className="passport-people">
              <h2>Tus encuentros</h2>
              {collectedProfiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelected(profile)}
                >
                  <Avatar profile={profile} />
                  <span>
                    <strong>{profile.name}</strong>
                    <small>
                      {roleLabels[profile.role]} · {profile.city}
                    </small>
                  </span>
                  <ChevronRight size={18} />
                </button>
              ))}
            </section>
          )}
          {authEnabled && (
            <button
              className="text-button signout-button"
              type="button"
              onClick={() => void endSession()}
            >
              Cerrar sesión
            </button>
          )}
        </main>
      )}
      {view === "scan" && (
        <main className="page camera-page">
          <div className="page-center">
            <h1>
              Escanear <em>badge</em>
            </h1>
            <p>Apuntá al QR de la persona que conociste</p>
          </div>
          <Steps stage={1} />
          <div className={`camera-stage ${cameraOpen ? "camera-active" : ""}`}>
            {cameraOpen ? (
              <video ref={videoRef} muted playsInline />
            ) : (
              <div className="camera-placeholder">
                <QrCode size={105} />
                <span>El encuentro empieza con un hola</span>
              </div>
            )}
            <div className="scan-frame">
              <i />
              <i />
              <i />
              <i />
            </div>
            <canvas ref={canvasRef} hidden />
          </div>
          <p className="camera-hint">
            {message || "Escaneá el QR del badge para continuar"}
          </p>
          <div className="camera-controls">
            {!authEnabled ? (
              <button
                className="round-button"
                type="button"
                onClick={() =>
                  document
                    .getElementById("demo-badges")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                aria-label="Ver badges de prueba"
              >
                <ImagePlus size={23} />
              </button>
            ) : <span />}
            <button
              className="shutter"
              type="button"
              onClick={() => (cameraOpen ? stopCamera() : openCamera("scan"))}
              aria-label={cameraOpen ? "Cerrar cámara" : "Abrir cámara"}
            >
              <ScanLine size={31} />
            </button>
            <span className="camera-tip">
              Después, sacate
              <br />
              una foto para
              <br />
              sumar el encuentro
            </span>
          </div>
          {!authEnabled && <div className="demo-badges" id="demo-badges">
            <small>BADGES DE PRUEBA</small>
            {profiles.slice(0, 3).map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => badgeFound(`comunid:builder:${profile.id}`)}
              >
                <Avatar profile={profile} />
                <span>
                  {profile.name}
                  <small>{roleLabels[profile.role]}</small>
                </span>
                <QrCode size={18} />
              </button>
            ))}
          </div>}
        </main>
      )}
      {view === "selfie" && (
        <main className="page camera-page">
          <div className="page-center">
            <h1>
              Selfie del <em>encuentro</em>
            </h1>
            <p>Sacá una foto juntos para completar el encuentro.</p>
          </div>
          <Steps stage={2} />
          <div className="camera-stage selfie-stage">
            {selfie ? (
              <img src={selfie} alt="Selfie del encuentro" />
            ) : cameraOpen ? (
              <video ref={videoRef} muted playsInline />
            ) : (
              <div className="camera-placeholder">
                <Users size={105} />
                <span>Una foto para recordar este encuentro</span>
              </div>
            )}
            <div className="selfie-frame" />
            <canvas ref={canvasRef} hidden />
          </div>
          <div className="selfie-with">
            <Avatar profile={pending || profiles[0]} />
            <span>
              Con {pending?.name || "tu nueva conexión"} ·{" "}
              <em>{pending ? roleLabels[pending.role] : ""}</em>
            </span>
          </div>
          <p className="camera-hint">
            {message ||
              "La foto queda en esta sesión y no se sube al servidor."}
          </p>
          <div className="camera-controls">
            <button
              className="round-button"
              type="button"
              onClick={() => {
                setSelfie(null);
                if (cameraOpen) stopCamera();
              }}
              aria-label="Repetir foto"
            >
              <X size={22} />
            </button>
            <button
              className="shutter selfie-shutter"
              type="button"
              onClick={() =>
                selfie
                  ? setSelfie(null)
                  : cameraOpen
                    ? captureSelfie()
                    : openCamera("selfie")
              }
              aria-label={
                selfie
                  ? "Repetir selfie"
                  : cameraOpen
                    ? "Sacar selfie"
                    : "Abrir cámara"
              }
            >
              <Camera size={28} />
            </button>
            <span className="camera-tip">
              Sacá la foto
              <br />
              para ganar tu sello
            </span>
          </div>
          <button
            className="primary-button finish-button"
            type="button"
            disabled={!pending}
            onClick={finishEncounter}
          >
            {selfie ? "Guardar encuentro" : "Continuar sin foto"}
            <ChevronRight size={20} />
          </button>
        </main>
      )}
      {view === "success" && pending && (
        <main className="page success-page">
          <div className="page-center">
            <span className="confetti">✦ &nbsp; ✧ &nbsp; ✦</span>
            <h1>
              ¡Encuentro
              <br />
              <em>registrado!</em>
            </h1>
            <p>Nueva persona en tu comunidad.</p>
          </div>
          <div className="success-photo">
            {selfie ? (
              <img src={selfie} alt="Selfie del encuentro" />
            ) : (
              <div className="success-avatar">
                <Avatar profile={pending} large />
              </div>
            )}
            <span className="photo-sparkle">✦</span>
          </div>
          <div className="success-person">
            <Avatar profile={pending} />
            <span>
              <small>{roleLabels[pending.role].toUpperCase()} ENCONTRADO</small>
              <strong>
                {pending.name} · {roleLabels[pending.role]}
              </strong>
              <small>Nueva persona en tu comunidad.</small>
            </span>
            <span className="seal">
              SELLO
              <br />✦
            </span>
          </div>
          <div className="success-progress">
            <span>
              <small>TU PASAPORTE</small>
              <strong>
                {collectedProfiles.length} de {profiles.length} encuentros
              </strong>
            </span>
            <BookOpen size={24} />
            <div className="progress-track">
              <i
                style={{
                  width: `${Math.min(100, (collectedProfiles.length / Math.max(profiles.length, 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="success-reward">
            <Gift size={27} />
            <span>
              <strong>¡Nuevo sello desbloqueado!</strong>
              <small>Sumás un sello a tu pasaporte.</small>
            </span>
            <Sparkles size={19} />
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => go("passport")}
          >
            Ver mi pasaporte <ChevronRight size={20} />
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => go("discover")}
          >
            Seguir explorando
          </button>
        </main>
      )}
      {inApp && (
        <nav className="bottom-nav" aria-label="Navegación principal">
          <button
            className={view === "discover" ? "active" : ""}
            type="button"
            onClick={() => go("discover")}
          >
            <Compass size={21} />
            <span>Descubrir</span>
          </button>
          <button
            className={
              ["scan", "selfie", "success"].includes(view) ? "active" : ""
            }
            type="button"
            onClick={() => go("scan")}
          >
            <ScanLine size={22} />
            <span>Escanear</span>
          </button>
          <button
            className={view === "passport" ? "active" : ""}
            type="button"
            onClick={() => go("passport")}
          >
            <BookOpen size={22} />
            <span>Pasaporte</span>
          </button>
        </nav>
      )}
      {selected && (
        <ProfileDialog
          profile={selected}
          collected={collectedIds.has(selected.id)}
          onClose={() => setSelected(null)}
          onScan={() => {
            setSelected(null);
            go("scan");
          }}
        />
      )}
    </div>
  );
}
function Steps({ stage }: { stage: 1 | 2 }) {
  return (
    <div className="steps">
      <span className={stage === 1 ? "current" : "done"}>
        {stage === 1 ? "1" : <Check size={16} />}
        <small>Escanear</small>
      </span>
      <i />
      <span className={stage === 2 ? "current" : ""}>
        2<small>Selfie</small>
      </span>
      <i />
      <span>
        3<small>Sello</small>
      </span>
    </div>
  );
}
function ProfileDialog({
  profile,
  collected,
  onClose,
  onScan,
}: {
  profile: BuilderProfile;
  collected: boolean;
  onClose: () => void;
  onScan: () => void;
}) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    if (!collected) return;
    const url = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;
    QRCode.toDataURL(`${String(url).replace(/\/$/, "")}/b/${profile.id}`, {
      width: 250,
      margin: 1,
    }).then(setQr);
  }, [profile.id, collected]);
  return (
    <div className="sheet-backdrop" onMouseDown={onClose}>
      <section
        className="profile-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Perfil de ${profile.name}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="sheet-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        <div className="sheet-identity">
          <Avatar profile={profile} large />
          <span>
            <small>{roleLabels[profile.role]}</small>
            <h2>{profile.name}</h2>
            <p>{profile.title}</p>
          </span>
        </div>
        <p className="location-line">
          <MapPin size={16} /> {profile.city} · {profile.community}
        </p>
        <p className="profile-story">{profile.story}</p>
        <div className="detail-block">
          <Sparkles size={21} />
          <span>
            <small>SUPERPODER EN LA COMUNIDAD</small>
            <strong>{profile.superpower}</strong>
          </span>
        </div>
        <div className="detail-block">
          <Users size={21} />
          <span>
            <small>PARA EMPEZAR UNA CHARLA</small>
            <strong>
              Preguntame sobre {profile.askMeAbout.toLowerCase()}.
            </strong>
          </span>
        </div>
        {collected ? (
          <div className="qr-share">
            {qr && <img src={qr} alt={`QR de ${profile.name}`} />}
            <span>
              <strong>En tu pasaporte</strong>
              <small>Compartí este código para presentar a esta persona.</small>
            </span>
          </div>
        ) : (
          <button className="primary-button" type="button" onClick={onScan}>
            <ScanLine size={20} /> Escanear su badge
          </button>
        )}
      </section>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
