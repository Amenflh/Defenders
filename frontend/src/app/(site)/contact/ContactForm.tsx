"use client";

import { useActionState, useEffect, useRef } from "react";
import { Icon } from "@/components/Icon";
import { PhoneField } from "@/components/PhoneField";
import { RulesAgreement } from "@/components/RulesAgreement";
import { useI18n } from "@/lib/i18n/client";
import { submitContact, type ContactFields, type ContactState } from "./actions";

const DEFAULT_TRAININGS: { value: string; label: string; dot: string }[] = [
  { value: "pilates", label: "Pilates", dot: "bg-pilates" },
  { value: "football", label: "Football", dot: "bg-football" },
  { value: "personal-training", label: "Personal Training", dot: "bg-personal" },
];

const initialState: ContactState = { status: "idle", attempt: 0 };

export type ContactDefaults = Partial<Record<"firstName" | "lastName" | "email" | "phone", string>>;
export type ContactInquiryCopy = Partial<{
  firstNameLabel: string;
  lastNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  consentText: string;
  submitLabel: string;
}>;

export function ContactForm({
  preselected,
  defaults = {},
  availableTrainings = DEFAULT_TRAININGS,
  variant = "classic",
  onSuccess,
  inquiryCopy = {},
}: {
  preselected?: string;
  availableTrainings?: { value: string; label: string; dot?: string }[];
  /** Coordonnées du client connecté, pour pré-remplir le formulaire. */
  defaults?: ContactDefaults;
  /** quick : inscription express (après une vidéo) — mêmes champs, sans message ni pièce jointe. */
  variant?: "classic" | "reservation" | "inquiry" | "quick";
  onSuccess?: (message: string) => void;
  inquiryCopy?: ContactInquiryCopy;
}) {
  const [state, action, pending] = useActionState(submitContact, initialState);
  const { t } = useI18n();
  const f = t.form;
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  useEffect(() => {
    if (variant === "reservation" && state.status === "success") {
      onSuccess?.(state.message ?? "Votre demande a bien été envoyée.");
    }
  }, [onSuccess, state, variant]);

  const v = state.status === "error" ? state.values : undefined;
  // Valeurs renvoyées après une erreur, sinon pré-remplissage avec le compte connecté.
  const val = (k: string) =>
    typeof v?.[k] === "string" ? (v[k] as string) : v ? "" : (defaults[k as keyof ContactDefaults] ?? "");
  const err = (k: ContactFields) => state.errors?.[k]?.[0];
  const trainings = v ? (Array.isArray(v.trainings) ? v.trainings : []) : preselected ? [preselected] : [];

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border border-gold/40 bg-gold/10 p-10 text-center outline-none">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold text-ink">
          <Icon name="check" width={32} height={32} />
        </span>
        <h2 className="mt-6 font-display text-3xl tracking-wide uppercase">{f.sent}</h2>
        <p className="mx-auto mt-3 max-w-md text-mist">{state.message}</p>
      </div>
    );
  }

  return (
    // La clé change à chaque envoi : le formulaire est remonté avec les valeurs renvoyées.
    <form key={state.attempt} action={action} noValidate className="space-y-10">
      {state.status === "error" && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="border border-red-500/50 bg-red-500/10 px-5 py-4 text-sm text-red-200 outline-none">
          {state.message}
        </div>
      )}

      {/* Piège anti-spam invisible pour les humains */}
      <div className="hidden" aria-hidden="true">
        <label>
          Site web <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {variant === "inquiry" ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={inquiryCopy.firstNameLabel || f.firstName} name="firstName" autoComplete="given-name" required defaultValue={val("firstName")} error={err("firstName")} />
            <Field label={inquiryCopy.lastNameLabel || f.lastName} name="lastName" autoComplete="family-name" required defaultValue={val("lastName")} error={err("lastName")} />
            <Field label={inquiryCopy.emailLabel || f.email} name="email" type="email" autoComplete="email" required defaultValue={val("email")} error={err("email")} />
            <PhoneField label={inquiryCopy.phoneLabel || f.phone} name="phone" required defaultValue={val("phone")} error={err("phone")} />
          </div>
          <input type="hidden" name="profile" value="demande-info" />
          <Fieldset legend={inquiryCopy.messageLabel || f.step4.replace(/^\d+\.\s*/, "")}>
            <label htmlFor="message" className="sr-only">{f.message}</label>
            <textarea id="message" name="message" rows={5} maxLength={2000} required defaultValue={val("message")} placeholder={inquiryCopy.messagePlaceholder || f.messagePlaceholder} className="w-full border border-line bg-ink px-4 py-3 text-bone placeholder:text-mist/50 focus:border-gold focus:outline-none" />
            {err("message") && <p className="mt-2 text-sm text-red-300">{err("message")}</p>}
          </Fieldset>
        </>
      ) : (
        <>
          <Fieldset legend={f.step1}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={f.firstName} name="firstName" autoComplete="given-name" required defaultValue={val("firstName")} error={err("firstName")} />
              <Field label={f.lastName} name="lastName" autoComplete="family-name" required defaultValue={val("lastName")} error={err("lastName")} />
              <Field label={f.email} name="email" type="email" autoComplete="email" required defaultValue={val("email")} error={err("email")} />
              <PhoneField label={f.phone} name="phone" required defaultValue={val("phone")} error={err("phone")} />
              <Field label={f.city} name="city" autoComplete="address-level2" defaultValue={val("city")} error={err("city")} className="sm:col-span-2" />
            </div>
          </Fieldset>

          <Fieldset legend={f.step2} error={err("profile")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {f.profiles.map((p) => (
                <ChoiceCard key={p.value} type="radio" name="profile" value={p.value} defaultChecked={val("profile") === p.value}>
                  <span className="block font-medium">{p.label}</span>
                  <span className="mt-0.5 block text-xs text-mist">{p.hint}</span>
                </ChoiceCard>
              ))}
            </div>
          </Fieldset>

          <Fieldset legend={f.step3} hint={f.step3Hint} error={err("trainings")}>
            <div className="grid gap-3 sm:grid-cols-3">
              {availableTrainings.map((t) => (
                <ChoiceCard key={t.value} type="checkbox" name="trainings" value={t.value} defaultChecked={trainings.includes(t.value)}>
                  <span className="flex items-center gap-2 font-medium">
                    <span className={`size-2.5 rounded-full ${t.dot ?? "bg-gold"}`} /> {t.label}
                  </span>
                </ChoiceCard>
              ))}
            </div>
          </Fieldset>

          {variant !== "quick" && (
          <>
          <Fieldset legend={f.step4} hint={f.optional}>
            <label htmlFor="message" className="sr-only">{f.message}</label>
            <textarea id="message" name="message" rows={5} maxLength={2000} defaultValue={val("message")} placeholder={f.messagePlaceholder} className="w-full border border-line bg-ink px-4 py-3 text-bone placeholder:text-mist/50 focus:border-gold focus:outline-none" />
            {err("message") && <p className="mt-2 text-sm text-red-300">{err("message")}</p>}
          </Fieldset>

          <Fieldset legend={f.step5} hint={f.attachmentHint}>
            <label htmlFor="attachment" className="sr-only">{f.step5.replace(/^\d+\.\s*/, "")}</label>
            <input id="attachment" name="attachment" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="block w-full border border-line bg-ink px-4 py-3 text-sm text-mist file:mr-4 file:border-0 file:bg-gold file:px-4 file:py-2 file:font-display file:text-xs file:uppercase file:text-ink" />
          </Fieldset>
          </>
          )}

          <Fieldset legend={variant === "quick" ? f.step6.replace(/^\d+\./, "4.") : f.step6}>
            <RulesAgreement defaultAccepted={val("rulesAccepted") === "on"} error={err("rulesAccepted")} />
          </Fieldset>
        </>
      )}

      <div>
        <label className="flex items-start gap-3 text-sm text-mist">
          <input type="checkbox" name="consent" defaultChecked={val("consent") === "on"} className="mt-1 size-4 accent-[var(--color-gold)]" />
          {variant === "inquiry" ? inquiryCopy.consentText || f.consent : f.consent}
        </label>
        {err("consent") && <p className="mt-2 text-sm text-red-300">{err("consent")}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {pending ? f.sending : variant === "inquiry" ? inquiryCopy.submitLabel || f.submit : variant === "quick" ? f.submitQuick : f.submit}
        {!pending && <Icon name="arrow" className="rtl:-scale-x-100" />}
      </button>
    </form>
  );
}

function Fieldset({ legend, hint, error, children }: { legend: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <fieldset aria-invalid={error ? true : undefined}>
      <legend className="mb-4 flex w-full items-baseline justify-between gap-4 font-display text-lg tracking-[0.08em] uppercase">
        {legend}
        {hint && <span className="font-sans text-xs tracking-normal text-mist normal-case">{hint}</span>}
      </legend>
      {children}
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </fieldset>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type">;

function Field({ label, name, type = "text", required, error, className = "", ...rest }: FieldProps) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-mist">
        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full border bg-ink px-4 py-3 text-bone placeholder:text-mist/50 focus:border-gold focus:outline-none ${error ? "border-red-500/70" : "border-line"}`}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceCard({
  type,
  name,
  value,
  defaultChecked,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 border border-line bg-ink px-4 py-3.5 transition-colors hover:border-bone/40 has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
      <input type={type} name={name} value={value} defaultChecked={defaultChecked} className="mt-1 size-4 shrink-0 accent-[var(--color-gold)]" />
      <span className="min-w-0">{children}</span>
    </label>
  );
}
