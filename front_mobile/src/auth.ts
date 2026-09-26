import { Amplify } from "aws-amplify";
import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";

const userPoolId = String(import.meta.env.VITE_COGNITO_USER_POOL_ID || "");
const clientId = String(import.meta.env.VITE_COGNITO_CLIENT_ID || "");
export const authEnabled = Boolean(userPoolId && clientId);

if (authEnabled) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId: clientId,
        loginWith: { email: true },
      },
    },
  });
}

export type AttendeeSession = { userId: string; name: string; email: string };

export async function currentSession(): Promise<AttendeeSession | null> {
  if (!authEnabled) return null;
  try {
    const [user, session, attributes] = await Promise.all([
      getCurrentUser(),
      fetchAuthSession(),
      fetchUserAttributes().catch(() => null),
    ]);
    const accessToken = session.tokens?.accessToken?.toString();
    return accessToken
      ? {
          userId: user.userId,
          name: attributes?.name || "",
          email: attributes?.email || (user.username.includes("@") ? user.username : ""),
        }
      : null;
  } catch {
    return null;
  }
}

export async function accessToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  if (!token) throw new Error("Tu sesión venció. Iniciá sesión de nuevo.");
  return token;
}

export async function login(email: string, password: string): Promise<void> {
  const result = await signIn({ username: email.trim(), password });
  if (!result.isSignedIn)
    throw new Error(
      "Necesitamos completar una verificación adicional para iniciar sesión.",
    );
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<boolean> {
  const result = await signUp({
    username: email.trim(),
    password,
    options: { userAttributes: { email: email.trim(), name: name.trim() } },
  });
  return result.isSignUpComplete;
}

export async function confirmRegistration(
  email: string,
  code: string,
): Promise<void> {
  const result = await confirmSignUp({
    username: email.trim(),
    confirmationCode: code.trim(),
  });
  if (!result.isSignUpComplete)
    throw new Error("Todavía falta confirmar el correo.");
}

export async function resendRegistrationCode(email: string): Promise<void> {
  await resendSignUpCode({ username: email.trim() });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await resetPassword({ username: email.trim() });
}

export async function completePasswordReset(
  email: string,
  code: string,
  password: string,
): Promise<void> {
  await confirmResetPassword({
    username: email.trim(),
    confirmationCode: code.trim(),
    newPassword: password,
  });
}

export async function logout(): Promise<void> {
  await signOut();
}

export function authErrorMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : "";
  const messages: Record<string, string> = {
    UsernameExistsException: "Ese correo ya tiene una cuenta. Iniciá sesión.",
    UserNotConfirmedException: "Confirmá tu correo para continuar.",
    CodeMismatchException:
      "El código no coincide. Revisalo e intentá de nuevo.",
    ExpiredCodeException: "El código venció. Pedí uno nuevo.",
    NotAuthorizedException: "Correo o contraseña incorrectos.",
    UserNotFoundException: "Correo o contraseña incorrectos.",
    InvalidPasswordException:
      "La contraseña no cumple los requisitos indicados.",
    LimitExceededException:
      "Se alcanzó el límite de intentos. Probá más tarde.",
    TooManyRequestsException: "Demasiados intentos. Probá más tarde.",
  };
  return (
    messages[name] ||
    (error instanceof Error
      ? error.message
      : "No pudimos completar la operación. Intentá de nuevo.")
  );
}
