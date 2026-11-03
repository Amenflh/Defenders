"use server";

import { headers } from "next/headers";
import { backendUrl } from "@/lib/api";

export type ContactFields =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "city"
  | "profile"
  | "trainings"
  | "availability"
  | "message"
  | "consent";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<ContactFields, string[]>>;
  /** Valeurs saisies, renvoyées pour pré-remplir le formulaire après une erreur. */
  values?: Record<string, string | string[]>;
  /** Incrémenté à chaque envoi pour réinitialiser le formulaire. */
  attempt: number;
};

export async function submitContact(prev: ContactState, formData: FormData): Promise<ContactState> {
  const str = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };

  const payload = {
    firstName: str("firstName"),
    lastName: str("lastName"),
    email: str("email"),
    phone: str("phone"),
    city: str("city"),
    profile: str("profile") || undefined,
    trainings: formData.getAll("trainings").filter((v): v is string => typeof v === "string"),
    availability: str("availability") || undefined,
    message: str("message"),
    consent: formData.get("consent") === "on",
    website: str("website"),
  };

  const values = {
    ...payload,
    profile: payload.profile ?? "",
    availability: payload.availability ?? "",
    consent: payload.consent ? "on" : "",
  };
  const attempt = prev.attempt + 1;

  // L'API limite le nombre d'envois par IP : on lui transmet l'IP du visiteur,
  // sinon toutes les demandes sembleraient venir du conteneur frontend.
  const requestHeaders = await headers();
  const clientIp =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";

  try {
    const res = await fetch(backendUrl("/api/contact"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": clientIp },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      return {
        status: "success",
        message: `Merci ${payload.firstName} ! Votre demande a bien été envoyée. Notre équipe vous recontacte très rapidement.`,
        attempt,
      };
    }

    if (res.status === 422) {
      const data = (await res.json()) as { errors?: ContactState["errors"] };
      return { status: "error", message: "Merci de corriger les champs indiqués.", errors: data.errors, values, attempt };
    }

    if (res.status === 429) {
      return { status: "error", message: "Trop de demandes envoyées. Réessayez dans quelques minutes.", values, attempt };
    }

    throw new Error(`Réponse inattendue de l'API : ${res.status}`);
  } catch (err) {
    console.error("[contact]", err);
    return {
      status: "error",
      message: "Le service est momentanément indisponible. Vous pouvez aussi nous joindre par téléphone ou e-mail.",
      values,
      attempt,
    };
  }
}
