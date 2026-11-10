"use server";

import { cookies } from "next/headers";
import { REFERRAL_COOKIE } from "@/lib/program";
import { apiFetch } from "@/lib/session";

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
  | "consent"
  | "rulesAccepted";

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

  const attachment = formData.get("attachment");
  let attachmentPayload: { filename: string; contentType: string; base64: string } | undefined;

  if (typeof attachment === "object" && attachment instanceof File && attachment.size > 0) {
    if (attachment.size > 5 * 1024 * 1024) {
      return { status: "error", message: "La pièce jointe ne doit pas dépasser 5 Mo.", attempt: prev.attempt + 1 };
    }
    if (!["application/pdf", "image/jpeg", "image/png"].includes(attachment.type)) {
      return { status: "error", message: "La pièce jointe doit être un PDF, JPG/JPEG ou PNG.", attempt: prev.attempt + 1 };
    }
    const bytes = await attachment.arrayBuffer();
    attachmentPayload = {
      filename: attachment.name,
      contentType: attachment.type || "application/octet-stream",
      base64: Buffer.from(bytes).toString("base64"),
    };
  }

  const payload = {
    firstName: str("firstName"),
    lastName: str("lastName"),
    email: str("email"),
    phone: str("phone"),
    city: str("city"),
    profile: str("profile") || undefined,
    trainings: formData.getAll("trainings").filter((v): v is string => typeof v === "string"),
    message: str("message"),
    consent: formData.get("consent") === "on",
    // Lecture du règlement intérieur confirmée (obligatoire pour une inscription, ignorée pour une simple question).
    rulesAccepted: formData.get("rulesAccepted") === "on",
    website: str("website"),
    attachment: attachmentPayload,
    // Lien de parrainage suivi dans les 30 derniers jours (code vérifié par l'API, ignoré s'il est invalide).
    referralCode: (await cookies()).get(REFERRAL_COOKIE)?.value || undefined,
  };

  const values = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    city: payload.city,
    trainings: payload.trainings,
    message: payload.message,
    profile: payload.profile ?? "",
    consent: payload.consent ? "on" : "",
    rulesAccepted: payload.rulesAccepted ? "on" : "",
  };
  const attempt = prev.attempt + 1;

  try {
    // apiFetch transmet l'IP du visiteur (rate limit) et le jeton de session :
    // la demande est ainsi rattachée au compte client connecté.
    const res = await apiFetch("/api/contact", { method: "POST", body: JSON.stringify(payload) });

    if (res.ok) {
      const data = (await res.json().catch(() => null)) as { emailSent?: boolean } | null;
      const isInquiry = payload.profile === "demande-info";
      return {
        status: "success",
        message: data?.emailSent
          ? `Merci ${payload.firstName} ! Votre message a bien été transmis à notre équipe, qui vous recontactera très rapidement.`
          : isInquiry
            ? `Merci ${payload.firstName} ! Votre message est bien enregistré dans le tableau de bord de notre équipe. Nous vous recontacterons très rapidement.`
            : `Merci ${payload.firstName} ! Votre demande a été enregistrée. Vous pouvez aussi nous joindre par téléphone si vous souhaitez accélérer le contact.`,
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
