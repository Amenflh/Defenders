"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PhoneField } from "@/components/PhoneField";
import { submitSecurityQuote, type SecurityQuoteField, type SecurityQuoteState } from "./actions";

export type SecurityQuoteCopy = {
  title: string;
  description: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  city: string;
  service: string;
  servicePlaceholder: string;
  services: { value: string; label: string }[];
  message: string;
  messagePlaceholder: string;
  consent: string;
  privacy: string;
  submit: string;
  sending: string;
  successTitle: string;
  successText: string;
  validationError: string;
  rateLimitError: string;
  blockedError: string;
  unavailableError: string;
};

const initialState: SecurityQuoteState = { status: "idle", attempt: 0 };

export function SecurityQuoteForm({ copy }: { copy: SecurityQuoteCopy }) {
  const [state, action, pending] = useActionState(submitSecurityQuote, initialState);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border border-gold/40 bg-gold/10 p-8 outline-none sm:p-10">
        <span className="grid size-12 place-items-center border border-gold/50 text-gold">
          <Icon name="check" width={24} height={24} />
        </span>
        <h3 className="mt-5 font-display text-2xl uppercase text-bone">{copy.successTitle}</h3>
        <p className="mt-2 leading-relaxed text-mist">{copy.successText}</p>
      </div>
    );
  }

  const fieldError = (field: SecurityQuoteField) => state.errors?.includes(field) ? copy.validationError : undefined;
  const value = (field: SecurityQuoteField) => state.values?.[field] ?? "";
  const errorMessage = state.errorCode === "validation" ? copy.validationError
    : state.errorCode === "rateLimit" ? copy.rateLimitError
      : state.errorCode === "blocked" ? copy.blockedError
        : state.errorCode === "unavailable" ? copy.unavailableError : undefined;

  return (
    <form key={state.attempt} action={action} noValidate className="border border-line bg-ink p-6 sm:p-8">
      {errorMessage && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="mb-6 border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200 outline-none">
          {errorMessage}
        </div>
      )}
      <div className="hidden" aria-hidden="true">
        <label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="firstName" label={copy.firstName} required value={value("firstName")} error={fieldError("firstName")} />
        <TextField name="lastName" label={copy.lastName} required value={value("lastName")} error={fieldError("lastName")} />
        <TextField name="companyName" label={copy.companyName} value={value("companyName")} error={fieldError("companyName")} />
        <TextField name="email" label={copy.email} type="email" required value={value("email")} error={fieldError("email")} />
        <PhoneField name="phone" label={copy.phone} required defaultValue={value("phone")} error={fieldError("phone")} />
        <TextField name="city" label={copy.city} value={value("city")} error={fieldError("city")} />
      </div>
      <div className="mt-5">
        <label htmlFor="security-quote-service" className="mb-1.5 block text-sm text-mist">{copy.service} <span className="text-gold" aria-hidden="true">*</span></label>
        <select
          id="security-quote-service"
          name="service"
          required
          defaultValue={value("service")}
          aria-invalid={fieldError("service") ? true : undefined}
          aria-describedby={fieldError("service") ? "security-quote-service-error" : undefined}
          className="w-full border border-line bg-ink-2 px-4 py-3 text-bone focus:border-gold focus:outline-none"
        >
          <option value="">{copy.servicePlaceholder}</option>
          {copy.services.map((service) => <option key={service.value} value={service.value}>{service.label}</option>)}
        </select>
        {fieldError("service") && <p id="security-quote-service-error" className="mt-1.5 text-sm text-red-300">{fieldError("service")}</p>}
      </div>
      <div className="mt-5">
        <label htmlFor="security-quote-message" className="mb-1.5 block text-sm text-mist">{copy.message} <span className="text-gold" aria-hidden="true">*</span></label>
        <textarea
          id="security-quote-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          defaultValue={value("message")}
          placeholder={copy.messagePlaceholder}
          aria-invalid={fieldError("message") ? true : undefined}
          aria-describedby={fieldError("message") ? "security-quote-message-error" : undefined}
          className="w-full border border-line bg-ink-2 px-4 py-3 text-bone placeholder:text-mist/50 focus:border-gold focus:outline-none"
        />
        {fieldError("message") && <p id="security-quote-message-error" className="mt-1.5 text-sm text-red-300">{fieldError("message")}</p>}
      </div>
      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm text-mist">
          <input type="checkbox" name="consent" defaultChecked={value("consent") === "on"} className="mt-1 size-4 accent-[var(--color-gold)]" />
          <span>{copy.consent} <Link href="/politique-de-confidentialite" className="text-gold underline underline-offset-4 hover:text-bone">{copy.privacy}</Link></span>
        </label>
        {fieldError("consent") && <p className="mt-1.5 text-sm text-red-300">{fieldError("consent")}</p>}
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary mt-7 w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {pending ? copy.sending : copy.submit}
        {!pending && <Icon name="arrow" className="rtl:-scale-x-100" />}
      </button>
    </form>
  );
}

function TextField({
  name,
  label,
  type = "text",
  required = false,
  value,
  error,
}: {
  name: string;
  label: string;
  type?: "text" | "email";
  required?: boolean;
  value: string;
  error?: string;
}) {
  const id = `security-quote-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-mist">{label} {required && <span className="text-gold" aria-hidden="true">*</span>}</label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={name === "firstName" ? "given-name" : name === "lastName" ? "family-name" : name === "companyName" ? "organization" : name}
        maxLength={name === "companyName" || name === "email" ? 120 : name === "firstName" || name === "lastName" ? 60 : 80}
        defaultValue={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full border bg-ink-2 px-4 py-3 text-bone focus:border-gold focus:outline-none ${error ? "border-red-500/70" : "border-line"}`}
      />
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm text-red-300">{error}</p>}
    </div>
  );
}
