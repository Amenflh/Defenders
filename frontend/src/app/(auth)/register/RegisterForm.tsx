"use client";

import { useActionState } from "react";
import { Icon } from "@/components/Icon";
import { registerAction, type RegisterState } from "../actions";
import { inputClass } from "../fields";

type FieldName = "name" | "email" | "phone" | "password" | "confirm";

export function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerAction, {});
  const err = (k: FieldName) => state.errors?.[k]?.[0];

  const field = (name: FieldName, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`r-${name}`} className="mb-1.5 block text-sm text-mist">{label}</label>
      <input
        id={`r-${name}`}
        name={name}
        required
        aria-invalid={err(name) ? true : undefined}
        aria-describedby={err(name) ? `r-${name}-error` : undefined}
        className={inputClass(!!err(name))}
        {...props}
      />
      {err(name) && <p id={`r-${name}-error`} className="mt-1.5 text-sm text-red-300">{err(name)}</p>}
    </div>
  );

  return (
    // La clé change avec les valeurs renvoyées : les champs sont pré-remplis après une erreur.
    <form key={JSON.stringify(state.values ?? {})} action={action} className="space-y-5">
      {state.error && (
        <p role="alert" className="border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}
      {field("name", "Nom complet", { autoComplete: "name", defaultValue: state.values?.name })}
      {field("email", "E-mail", { type: "email", autoComplete: "email", defaultValue: state.values?.email })}
      {field("phone", "Téléphone", { type: "tel", autoComplete: "tel", placeholder: "+216 ...", defaultValue: state.values?.phone })}
      <div className="grid gap-5 sm:grid-cols-2">
        {field("password", "Mot de passe", { type: "password", autoComplete: "new-password", minLength: 8 })}
        {field("confirm", "Confirmation", { type: "password", autoComplete: "new-password", minLength: 8 })}
      </div>
      <p className="text-xs text-mist">8 caractères minimum, avec au moins une lettre et un chiffre.</p>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-60">
        {pending ? "Création…" : "Créer mon compte"}
        {!pending && <Icon name="arrow" />}
      </button>
    </form>
  );
}
