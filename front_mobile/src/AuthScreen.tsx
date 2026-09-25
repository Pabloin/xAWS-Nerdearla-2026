import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import {
  authErrorMessage,
  completePasswordReset,
  confirmRegistration,
  login,
  register,
  requestPasswordReset,
  resendRegistrationCode,
} from "./auth";

type Mode = "login" | "signup" | "confirm" | "forgot" | "reset";

type Props = {
  brand: ReactNode;
  initialMode: "login" | "signup";
  onAuthenticated: () => void;
  onBack: () => void;
};

export function AuthScreen({
  brand,
  initialMode,
  onAuthenticated,
  onBack,
}: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function changeMode(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "login") {
        await login(email, password);
        onAuthenticated();
      } else if (mode === "signup") {
        const complete = await register(email, password);
        if (complete) {
          await login(email, password);
          onAuthenticated();
        } else {
          changeMode("confirm");
          setNotice("Te enviamos un código para confirmar tu correo.");
        }
      } else if (mode === "confirm") {
        await confirmRegistration(email, code);
        if (password) {
          await login(email, password);
          onAuthenticated();
        } else {
          changeMode("login");
          setNotice("Correo confirmado. Iniciá sesión.");
        }
      } else if (mode === "forgot") {
        await requestPasswordReset(email);
        changeMode("reset");
        setNotice("Te enviamos un código para restablecer la contraseña.");
      } else {
        await completePasswordReset(email, code, password);
        changeMode("login");
        setPassword("");
        setNotice("Contraseña actualizada. Iniciá sesión.");
      }
    } catch (reason) {
      if (
        reason instanceof Error &&
        reason.name === "UserNotConfirmedException"
      )
        changeMode("confirm");
      setError(authErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  const heading =
    mode === "signup" ? (
      <>
        Empezá tu
        <br />
        <em>aventura</em>
      </>
    ) : mode === "confirm" ? (
      <>
        Confirmá tu
        <br />
        <em>correo</em>
      </>
    ) : mode === "forgot" || mode === "reset" ? (
      <>
        Recuperá tu
        <br />
        <em>cuenta</em>
      </>
    ) : (
      <>
        Volvé a tu
        <br />
        <em>comunidad</em>
      </>
    );
  const subtitle =
    mode === "signup"
      ? "Creá tu cuenta y empezá tu pasaporte."
      : mode === "confirm"
        ? `Ingresá el código que enviamos a ${email}.`
        : mode === "forgot"
          ? "Te enviaremos un código a tu correo."
          : mode === "reset"
            ? "Elegí una contraseña nueva."
            : "Ingresá para continuar tu pasaporte.";
  const needsPassword =
    mode === "login" || mode === "signup" || mode === "reset";
  const needsCode = mode === "confirm" || mode === "reset";
  const submitText =
    mode === "signup"
      ? "Crear cuenta"
      : mode === "confirm"
        ? "Confirmar correo"
        : mode === "forgot"
          ? "Enviar código"
          : mode === "reset"
            ? "Guardar contraseña"
            : "Iniciar sesión";

  return (
    <main className="login-screen auth-screen">
      <button
        className="icon-button login-back"
        type="button"
        onClick={onBack}
        aria-label="Volver"
      >
        <ArrowLeft size={22} />
      </button>
      {brand}
      <div className="login-hero">
        <span className="login-mark">
          ✦<br />
          ●●●
        </span>
        <h1>{heading}</h1>
        <p>{subtitle}</p>
      </div>
      <form onSubmit={submit}>
        <label htmlFor="auth-email">Correo electrónico</label>
        <div className="input-wrap">
          <Mail size={20} />
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
            disabled={busy || mode === "confirm"}
          />
        </div>
        {needsCode && (
          <>
            <label htmlFor="auth-code">Código de verificación</label>
            <div className="input-wrap">
              <input
                id="auth-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Código de 6 dígitos"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={busy}
              />
            </div>
          </>
        )}
        {needsPassword && (
          <>
            <label htmlFor="auth-password">
              {mode === "reset" ? "Nueva contraseña" : "Contraseña"}
            </label>
            <div className="input-wrap">
              <LockKeyhole size={20} />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                required
                minLength={
                  mode === "signup" || mode === "reset" ? 12 : undefined
                }
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                disabled={busy}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </>
        )}
        {(mode === "signup" || mode === "reset") && (
          <p className="password-help">
            Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.
          </p>
        )}
        {mode === "login" && (
          <button
            className="auth-inline-link"
            type="button"
            onClick={() => {
              setPassword("");
              changeMode("forgot");
            }}
          >
            Olvidé mi contraseña
          </button>
        )}
        {notice && (
          <p className="auth-notice" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? "Un momento…" : submitText}
          <ChevronRight size={20} />
        </button>
      </form>
      {mode === "confirm" && (
        <button
          className="text-button"
          type="button"
          disabled={busy}
          onClick={async () => {
            try {
              await resendRegistrationCode(email);
              setNotice("Te enviamos otro código.");
              setError("");
            } catch (reason) {
              setError(authErrorMessage(reason));
            }
          }}
        >
          Reenviar código
        </button>
      )}
      {mode === "login" ? (
        <p className="auth-switch">
          ¿Primera vez?{" "}
          <button type="button" onClick={() => changeMode("signup")}>
            Crear cuenta
          </button>
        </p>
      ) : mode === "signup" || mode === "forgot" || mode === "reset" ? (
        <p className="auth-switch">
          ¿Ya tenés cuenta?{" "}
          <button type="button" onClick={() => changeMode("login")}>
            Iniciar sesión
          </button>
        </p>
      ) : null}
    </main>
  );
}
