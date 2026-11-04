"use client";

import { useActionState } from "react";
import { Icon } from "@/components/Icon";
import { loginAction, type LoginState } from "../actions";
import { inputClass } from "../fields";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p role="alert" className="border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-mist">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} className={inputClass(false)} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-mist">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass(false)} />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-60">
        {pending ? "Connexion…" : "Se connecter"}
        {!pending && <Icon name="arrow" />}
      </button>
    </form>
  );
}
