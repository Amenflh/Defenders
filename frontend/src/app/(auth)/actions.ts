"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, apiFetch, getSessionToken, homeFor, safeNext, type User } from "@/lib/session";

type SessionPayload = { token: string; expiresAt: string; user: User };

async function startSession({ token, expiresAt }: SessionPayload) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Mettre COOKIE_SECURE=true une fois le site servi en HTTPS.
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/* ------------------------------ Connexion ------------------------------ */

export type LoginState = { error?: string; email?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Saisissez votre e-mail et votre mot de passe.", email };

  let res: Response;
  try {
    res = await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  } catch {
    return { error: "Service indisponible. Réessayez dans un instant.", email };
  }
  if (res.status === 401 || res.status === 400) return { error: "E-mail ou mot de passe incorrect.", email };
  if (res.status === 429) return { error: "Trop de tentatives. Réessayez dans 15 minutes.", email };
  if (!res.ok) return { error: "Service indisponible. Réessayez dans un instant.", email };

  const session = (await res.json()) as SessionPayload;
  await startSession(session);
  // Un client ne peut pas être renvoyé vers l'espace admin.
  const next = safeNext(formData.get("next"));
  const allowed = next && !(session.user.role !== "admin" && next.startsWith("/admin"));
  redirect(allowed ? next : homeFor(session.user.role));
}

/* ------------------------------ Inscription ------------------------------ */

export type RegisterState = {
  error?: string;
  errors?: Partial<Record<"name" | "email" | "phone" | "password" | "confirm", string[]>>;
  values?: { name: string; email: string; phone: string };
};

export async function registerAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
  };
  const password = String(formData.get("password") ?? "");
  if (password !== String(formData.get("confirm") ?? "")) {
    return { errors: { confirm: ["Les mots de passe ne correspondent pas."] }, values };
  }

  let res: Response;
  try {
    res = await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify({ ...values, password }) });
  } catch {
    return { error: "Service indisponible. Réessayez dans un instant.", values };
  }
  if (res.status === 422 || res.status === 409) {
    const { errors } = (await res.json()) as { errors: RegisterState["errors"] };
    return { errors, values };
  }
  if (res.status === 429) return { error: "Trop de comptes créés depuis cette connexion. Réessayez plus tard.", values };
  if (!res.ok) return { error: "Service indisponible. Réessayez dans un instant.", values };

  await startSession((await res.json()) as SessionPayload);
  redirect("/");
}

/* ------------------------------ Déconnexion ------------------------------ */

export async function logoutAction(): Promise<void> {
  if (await getSessionToken()) {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
