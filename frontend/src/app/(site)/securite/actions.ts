"use server";

import { apiFetch } from "@/lib/session";

export type SecurityQuoteField =
  | "firstName"
  | "lastName"
  | "companyName"
  | "email"
  | "phone"
  | "city"
  | "service"
  | "message"
  | "consent";

export type SecurityQuoteState = {
  status: "idle" | "success" | "error";
  errorCode?: "validation" | "rateLimit" | "blocked" | "unavailable";
  errors?: SecurityQuoteField[];
  values?: Partial<Record<SecurityQuoteField, string>>;
  attempt: number;
};

export async function submitSecurityQuote(
  previous: SecurityQuoteState,
  formData: FormData,
): Promise<SecurityQuoteState> {
  const stringValue = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  const payload = {
    firstName: stringValue("firstName"),
    lastName: stringValue("lastName"),
    companyName: stringValue("companyName"),
    email: stringValue("email"),
    phone: stringValue("phone"),
    city: stringValue("city"),
    service: stringValue("service"),
    message: stringValue("message"),
    consent: formData.get("consent") === "on",
    website: stringValue("website"),
  };
  const values = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    companyName: payload.companyName,
    email: payload.email,
    phone: payload.phone,
    city: payload.city,
    service: payload.service,
    message: payload.message,
    consent: payload.consent ? "on" : "",
  };
  const attempt = previous.attempt + 1;

  try {
    const response = await apiFetch("/api/security-quotes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (response.status === 201) return { status: "success", attempt };
    if (response.status === 202) return { status: "error", errorCode: "blocked", values, attempt };
    if (response.status === 422) {
      const data = (await response.json()) as { errors?: Record<string, unknown> };
      return {
        status: "error",
        errorCode: "validation",
        errors: Object.keys(data.errors ?? {}) as SecurityQuoteField[],
        values,
        attempt,
      };
    }
    if (response.status === 429) return { status: "error", errorCode: "rateLimit", values, attempt };
    console.error(`[security-quote] unexpected API response: ${response.status}`);
  } catch (error) {
    console.error("[security-quote]", error);
  }
  return { status: "error", errorCode: "unavailable", values, attempt };
}
