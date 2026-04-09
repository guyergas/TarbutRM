"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function loginAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const email = formData.get("email");
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe") === "on";

  try {
    // redirectTo makes Auth.js set the cookie properly in the redirect response.
    // Pass rememberMe in the URL so we can strip the Expires after the redirect
    // if needed — handled by a separate cookie flag read in middleware.
    await signIn("credentials", {
      email,
      password,
      redirectTo: rememberMe ? "/" : `/?_rm=0`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "אימייל או סיסמא שגויים.";
        default:
          return "אירעה שגיאה. נסה שוב.";
      }
    }
    throw error; // re-throw redirect
  }
  return null;
}
