"use client";

import { useActionState } from "react";
import { Icon } from "@/components/Icon";
import { registerAction, type RegisterState } from "../actions";
import { inputClass } from "../fields";
import { useI18n } from "@/lib/i18n/client";

type FieldName = "name" | "email" | "phone" | "password" | "confirm";

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerAction, {});
  const err = (k: FieldName) => state.errors?.[k]?.[0];
  const A = useI18n().t.pages.auth;

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
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <p role="alert" className="border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}
      {field("name", A.fullName, { autoComplete: "name", defaultValue: state.values?.name })}
      {field("email", A.email, { type: "email", autoComplete: "email", defaultValue: state.values?.email })}
      {field("phone", A.phone, { type: "tel", autoComplete: "tel", placeholder: "+216 ...", defaultValue: state.values?.phone })}
      <div className="grid gap-5 sm:grid-cols-2">
        {field("password", A.password, { type: "password", autoComplete: "new-password", minLength: 8 })}
        {field("confirm", A.confirm, { type: "password", autoComplete: "new-password", minLength: 8 })}
      </div>
      <p className="text-xs text-mist">{A.passwordHint}</p>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-60">
        {pending ? A.creating : A.create}
        {!pending && <Icon name="arrow" className="rtl:-scale-x-100" />}
      </button>
    </form>
  );
}
