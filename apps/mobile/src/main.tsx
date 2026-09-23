import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  ArrowLeft,
  Camera,
  Check,
  Compass,
  LockKeyhole,
  MapPin,
  QrCode,
  ScanLine,
  Sparkles,
  Trophy,
  Users,
  X
} from "lucide-react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { demoProfiles, demoQuests } from "./demo-data";
import {
  collectEncounter,
  profileIdFromQr,
  questProgress,
  roleLabels,
  type BuilderProfile,
  type Encounter
} from "./domain";
import "./styles.css";

type View = "discover" | "scan" | "collection";

const storageKey = "comunid:encounters";
const playerStorageKey = "comunid:player-id";
const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function readStoredEncounters(): Encounter[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getPlayerId(): string {
  const current = localStorage.getItem(playerStorageKey);
  if (current) return current;
  const created = crypto.randomUUID();
  localStorage.setItem(playerStorageKey, created);
  return created;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ProfileAvatar({ profile, large = false }: { profile: BuilderProfile; large?: boolean }) {
  return (
    <div className={`avatar ${large ? "avatar-large" : ""}`} style={{ "--accent": profile.color } as React.CSSProperties}>
      <span>{initials(profile.name)}</span>
      <i aria-hidden="true" />
    </div>
  );
}

function ProfileCard({ profile, collected, onOpen }: { profile: BuilderProfile; collected: boolean; onOpen: () => void }) {
  return (
    <button className={`profile-card ${collected ? "collected" : "locked"}`} onClick={onOpen} type="button">
      <ProfileAvatar profile={profile} />
      <span className="profile-copy">
        <span className="role-label" style={{ color: profile.color }}>{roleLabels[profile.role]}</span>
        <strong>{collected ? profile.name : "Undiscovered builder"}</strong>
        <small>{collected ? `${profile.title} · ${profile.city}` : "Meet them and scan their badge"}</small>
      </span>
      <span className="card-state" aria-label={collected ? "Collected" : "Locked"}>
        {collected ? <Check size={18} /> : <LockKeyhole size={17} />}
      </span>
    </button>
  );
}

function ProfileDetail({ profile, collected, onClose, onCollect }: {
  profile: BuilderProfile;
  collected: boolean;
  onClose: () => void;
  onCollect: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(`https://comunid.app/b/${profile.id}`, {
      width: 320,
      margin: 1,
      color: { dark: "#101218", light: "#FFFFFF" }
    }).then(setQrDataUrl);
  }, [profile.id]);

  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="profile-sheet" role="dialog" aria-modal="true" aria-label={`${profile.name} profile`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="sheet-close" type="button" onClick={onClose} aria-label="Close profile"><X size={20} /></button>
        <div className="sheet-identity">
          <ProfileAvatar profile={profile} large />
          <div>
            <span className="role-pill" style={{ "--accent": profile.color } as React.CSSProperties}>{roleLabels[profile.role]}</span>
            <h2>{profile.name}</h2>
            <p>{profile.title}</p>
          </div>
        </div>
        <div className="location-line"><MapPin size={16} /> {profile.city} · {profile.community}</div>
        <p className="profile-story">{profile.story}</p>
        <div className="superpower-card" style={{ "--accent": profile.color } as React.CSSProperties}>
          <Sparkles size={19} />
          <div><span>Community superpower</span><strong>{profile.superpower}</strong></div>
        </div>
        <div className="prompt-card">
          <span>Start a conversation</span>
          <strong>“Ask me about {profile.askMeAbout.toLowerCase()}.”</strong>
        </div>
        {collected ? (
          <div className="qr-share">
            {qrDataUrl && <img src={qrDataUrl} alt={`QR code for ${profile.name}`} />}
            <div><span>Collected</span><strong>Part of your Comunid</strong><small>Share this code to introduce someone else.</small></div>
          </div>
        ) : (
          <button className="primary-button" type="button" onClick={onCollect}><ScanLine size={19} /> Demo: collect this builder</button>
        )}
      </section>
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>("discover");
  const [profiles, setProfiles] = useState<BuilderProfile[]>(demoProfiles);
  const [encounters, setEncounters] = useState<Encounter[]>(readStoredEncounters);
  const [selected, setSelected] = useState<BuilderProfile | null>(null);
  const [scanMessage, setScanMessage] = useState("Point your camera at a Comunid badge.");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const deepLinkHandledRef = useRef(false);
  const playerId = useMemo(getPlayerId, []);

  const collectedIds = useMemo(() => new Set(encounters.map((encounter) => encounter.builderId)), [encounters]);
  const collectedProfiles = profiles.filter((profile) => collectedIds.has(profile.id));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(encounters));
  }, [encounters]);

  useEffect(() => {
    if (!apiBaseUrl) return;
    fetch(`${apiBaseUrl}/profiles`)
      .then((result) => result.ok ? result.json() : Promise.reject(new Error("profiles unavailable")))
      .then((payload) => Array.isArray(payload.profiles) && payload.profiles.length && setProfiles(payload.profiles))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (deepLinkHandledRef.current) return;
    const profileId = profileIdFromQr(window.location.href);
    if (!profileId) return;
    const profile = profiles.find((candidate) => candidate.id === profileId);
    if (!profile) return;
    deepLinkHandledRef.current = true;
    collect(profile);
  }, [profiles]);

  const collect = (profile: BuilderProfile) => {
    setEncounters((current) => collectEncounter(current, profile.id));
    setSelected(profile);
  };

  const stopScanner = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    frameRef.current = null;
    streamRef.current = null;
    busyRef.current = false;
    setScannerOpen(false);
  };

  const resolvePayload = async (payload: string) => {
    const profileId = profileIdFromQr(payload);
    const profile = profiles.find((candidate) => candidate.id === profileId);
    if (!profile) throw new Error("This badge is not part of the current event.");

    if (apiBaseUrl) {
      const response = await fetch(`${apiBaseUrl}/encounters`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, eventId: "nerdearla-2026", playerId })
      });
      if (!response.ok) throw new Error("We found the badge, but could not save the encounter.");
    }

    collect(profile);
    setScanMessage(`${profile.name} joined your Comunid.`);
    setScanError(false);
    stopScanner();
  };

  const readFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      frameRef.current = requestAnimationFrame(readFrame);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    context.drawImage(video, 0, 0);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(image.data, image.width, image.height, { inversionAttempts: "attemptBoth" });
    if (code?.data && !busyRef.current) {
      busyRef.current = true;
      try {
        await resolvePayload(code.data);
        return;
      } catch (error) {
        busyRef.current = false;
        setScanError(true);
        setScanMessage(error instanceof Error ? error.message : "We could not read this badge.");
      }
    }
    frameRef.current = requestAnimationFrame(readFrame);
  };

  const startScanner = async () => {
    setScanError(false);
    setScanMessage("Opening camera…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      setScannerOpen(true);
      requestAnimationFrame(async () => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanMessage("Hold the badge inside the frame.");
        frameRef.current = requestAnimationFrame(readFrame);
      });
    } catch {
      setScanError(true);
      setScanMessage("Camera access is unavailable. Use a demo badge below.");
    }
  };

  useEffect(() => stopScanner, []);

  const changeView = (next: View) => {
    if (next !== "scan") stopScanner();
    setView(next);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="wordmark" onClick={() => changeView("discover")} type="button" aria-label="Comunid home">
          <span>comunid</span><i>.app</i>
        </button>
        <div className="event-chip"><span /> Nerdearla 2026</div>
      </header>

      <main>
        {view === "discover" && (
          <div className="page">
            <section className="welcome">
              <span className="eyebrow">Your community is here</span>
              <h1>Who will you<br /><em>meet today?</em></h1>
              <p>Find the people behind the talks, projects, and communities. Say hello. Scan their badge.</p>
              <button className="scan-cta" onClick={() => changeView("scan")} type="button">
                <span><ScanLine size={27} /></span>
                <div><strong>Scan a builder</strong><small>Unlock their community card</small></div>
                <QrCode size={22} />
              </button>
            </section>

            <section className="stats-strip" aria-label="Collection progress">
              <div><strong>{collectedProfiles.length}</strong><span>people met</span></div>
              <div><strong>{demoQuests.filter((quest) => questProgress(quest, profiles, encounters) >= quest.target).length}</strong><span>quests done</span></div>
              <div><strong>{new Set(collectedProfiles.map((profile) => profile.role)).size}</strong><span>roles found</span></div>
            </section>

            <section className="section-block">
              <div className="section-heading"><div><span>Live quests</span><h2>Find your people</h2></div><Trophy size={22} /></div>
              <div className="quest-list">
                {demoQuests.map((quest) => {
                  const progress = Math.min(questProgress(quest, profiles, encounters), quest.target);
                  return (
                    <article className="quest-card" key={quest.id}>
                      <div className="quest-top"><span className={progress >= quest.target ? "quest-icon complete" : "quest-icon"}>{progress >= quest.target ? <Check size={17} /> : <Compass size={17} />}</span><div><strong>{quest.title}</strong><p>{quest.description}</p></div><b>{progress}/{quest.target}</b></div>
                      <div className="progress-track"><span style={{ width: `${(progress / quest.target) * 100}%` }} /></div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="section-block">
              <div className="section-heading"><div><span>At the event</span><h2>Community signals</h2></div><Users size={22} /></div>
              <div className="profile-list">
                {profiles.slice(0, 4).map((profile) => <ProfileCard key={profile.id} profile={profile} collected={collectedIds.has(profile.id)} onOpen={() => setSelected(profile)} />)}
              </div>
            </section>
          </div>
        )}

        {view === "scan" && (
          <div className="page scan-page">
            <button className="back-button" type="button" onClick={() => changeView("discover")}><ArrowLeft size={19} /> Back</button>
            <div className="scan-title"><span className="eyebrow">Make a connection</span><h1>Scan their badge</h1><p>The QR unlocks their story and records your encounter.</p></div>
            <div className={`scanner ${scannerOpen ? "active" : ""}`}>
              {scannerOpen ? <video ref={videoRef} muted playsInline /> : <div className="scanner-idle"><div><Camera size={34} /></div><strong>Ready when you are</strong><span>Camera access stays on your device.</span></div>}
              <canvas ref={canvasRef} hidden />
              <span className="corner top-left" /><span className="corner top-right" /><span className="corner bottom-left" /><span className="corner bottom-right" />
            </div>
            <p className={`scan-message ${scanError ? "error" : ""}`}>{scanMessage}</p>
            <button className="primary-button" type="button" onClick={scannerOpen ? stopScanner : startScanner}>{scannerOpen ? <X size={19} /> : <Camera size={19} />}{scannerOpen ? "Close camera" : "Open camera"}</button>
            <div className="demo-badges"><span>Try the prototype</span><p>These buttons simulate QR badges while developing locally.</p>{profiles.slice(0, 3).map((profile) => <button type="button" key={profile.id} onClick={() => resolvePayload(`comunid:builder:${profile.id}`)}><ProfileAvatar profile={profile} /><span><strong>{profile.name}</strong><small>{roleLabels[profile.role]}</small></span><QrCode size={19} /></button>)}</div>
          </div>
        )}

        {view === "collection" && (
          <div className="page collection-page">
            <div className="collection-title"><span className="eyebrow">Your encounters</span><h1>My Comunid</h1><p>{collectedProfiles.length ? `${collectedProfiles.length} stories collected at Nerdearla.` : "Your collection begins with one hello."}</p></div>
            <div className="role-ribbon">{Object.entries(roleLabels).map(([role, label]) => <span className={collectedProfiles.some((profile) => profile.role === role) ? "found" : ""} key={role}><i />{label}</span>)}</div>
            <div className="profile-list collection-list">
              {profiles.map((profile) => <ProfileCard key={profile.id} profile={profile} collected={collectedIds.has(profile.id)} onOpen={() => collectedIds.has(profile.id) ? setSelected(profile) : changeView("scan")} />)}
            </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <button className={view === "discover" ? "active" : ""} onClick={() => changeView("discover")} type="button"><Compass size={21} /><span>Discover</span></button>
        <button className="nav-scan" onClick={() => changeView("scan")} type="button" aria-label="Scan badge"><span><ScanLine size={25} /></span></button>
        <button className={view === "collection" ? "active" : ""} onClick={() => changeView("collection")} type="button"><Users size={21} /><span>My Comunid</span></button>
      </nav>

      {selected && <ProfileDetail profile={selected} collected={collectedIds.has(selected.id)} onClose={() => setSelected(null)} onCollect={() => collect(selected)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
