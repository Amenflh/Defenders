"use client";

import { useActionState, useEffect, useRef } from "react";
import { Icon } from "@/components/Icon";
import type { DisciplineSlug } from "@/lib/disciplines";
import { submitContact, type ContactFields, type ContactState } from "./actions";

const PROFILES = [
  { value: "coach-pro", label: "Coach professionnel", hint: "J'exerce déjà comme coach / entraîneur" },
  { value: "jeune-diplome", label: "Jeune diplômé", hint: "Diplômé récemment en sciences du sport" },
  { value: "etudiant", label: "Étudiant", hint: "En cours de formation (STAPS, etc.)" },
  { value: "reconversion", label: "Reconversion", hint: "Je souhaite devenir coach" },
];

const TRAININGS: { value: DisciplineSlug; label: string; dot: string }[] = [
  { value: "pilates", label: "Pilates", dot: "bg-pilates" },
  { value: "football", label: "Football", dot: "bg-football" },
  { value: "personal-training", label: "Personal Training", dot: "bg-personal" },
];

const AVAILABILITIES = [
  { value: "intensif", label: "Session intensive (4 jours)" },
  { value: "semaine", label: "En semaine" },
  { value: "week-end", label: "Le week-end" },
  { value: "soir", label: "En soirée" },
];

const initialState: ContactState = { status: "idle", attempt: 0 };

export function ContactForm({ preselected }: { preselected?: DisciplineSlug }) {
  const [state, action, pending] = useActionState(submitContact, initialState);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const v = state.status === "error" ? state.values : undefined;
  const val = (k: string) => (typeof v?.[k] === "string" ? (v[k] as string) : "");
  const err = (k: ContactFields) => state.errors?.[k]?.[0];
  const trainings = v ? (Array.isArray(v.trainings) ? v.trainings : []) : preselected ? [preselected] : [];

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border border-gold/40 bg-gold/10 p-10 text-center outline-none">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold text-ink">
          <Icon name="check" width={32} height={32} />
        </span>
        <h2 className="mt-6 font-display text-3xl tracking-wide uppercase">Demande envoyée</h2>
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

      <Fieldset legend="1. Vos coordonnées">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom" name="firstName" autoComplete="given-name" required defaultValue={val("firstName")} error={err("firstName")} />
          <Field label="Nom" name="lastName" autoComplete="family-name" required defaultValue={val("lastName")} error={err("lastName")} />
          <Field label="E-mail" name="email" type="email" autoComplete="email" required defaultValue={val("email")} error={err("email")} />
          <Field label="Téléphone" name="phone" type="tel" autoComplete="tel" required placeholder="+216 ..." defaultValue={val("phone")} error={err("phone")} />
          <Field label="Ville" name="city" autoComplete="address-level2" defaultValue={val("city")} error={err("city")} className="sm:col-span-2" />
        </div>
      </Fieldset>

      <Fieldset legend="2. Votre profil" error={err("profile")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROFILES.map((p) => (
            <ChoiceCard key={p.value} type="radio" name="profile" value={p.value} defaultChecked={val("profile") === p.value}>
              <span className="block font-medium">{p.label}</span>
              <span className="mt-0.5 block text-xs text-mist">{p.hint}</span>
            </ChoiceCard>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="3. Formation souhaitée" hint="Plusieurs choix possibles" error={err("trainings")}>
        <div className="grid gap-3 sm:grid-cols-3">
          {TRAININGS.map((t) => (
            <ChoiceCard key={t.value} type="checkbox" name="trainings" value={t.value} defaultChecked={trainings.includes(t.value)}>
              <span className="flex items-center gap-2 font-medium">
                <span className={`size-2.5 rounded-full ${t.dot}`} /> {t.label}
              </span>
            </ChoiceCard>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="4. Disponibilité" error={err("availability")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {AVAILABILITIES.map((a) => (
            <ChoiceCard key={a.value} type="radio" name="availability" value={a.value} defaultChecked={val("availability") === a.value}>
              <span className="font-medium">{a.label}</span>
            </ChoiceCard>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="5. Votre message" hint="Facultatif">
        <label htmlFor="message" className="sr-only">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={2000}
          defaultValue={val("message")}
          placeholder="Vos questions, votre expérience, vos objectifs…"
          className="w-full border border-line bg-ink px-4 py-3 text-bone placeholder:text-mist/50 focus:border-gold focus:outline-none"
        />
        {err("message") && <p className="mt-2 text-sm text-red-300">{err("message")}</p>}
      </Fieldset>

      <div>
        <label className="flex items-start gap-3 text-sm text-mist">
          <input type="checkbox" name="consent" defaultChecked={val("consent") === "on"} className="mt-1 size-4 accent-[var(--color-gold)]" />
          J&apos;accepte que Defenders Fitness Academy utilise ces informations pour me recontacter au sujet de ma demande de
          formation.
        </label>
        {err("consent") && <p className="mt-2 text-sm text-red-300">{err("consent")}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {pending ? "Envoi en cours…" : "Envoyer ma demande"}
        {!pending && <Icon name="arrow" />}
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
