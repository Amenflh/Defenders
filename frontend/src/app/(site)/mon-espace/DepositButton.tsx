"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { formatTnd } from "@/lib/program";
import { startDepositAction } from "./actions";
import { accountDictionaries } from "@/lib/i18n/account";
import { useI18n } from "@/lib/i18n/client";

/** « Payer l'acompte » : crée le paiement puis envoie le stagiaire sur la page sécurisée du prestataire. */
export function DepositButton({ registrationId, amountTnd, simulation }: { registrationId: string; amountTnd: number; simulation?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const D = accountDictionaries[useI18n().locale].deposit;

  return (
    <div className="mt-5 border-t border-line pt-5">
      <p className="text-sm text-bone">{D.title}</p>
      <p className="mt-1 text-xs text-mist">
        {D.text(formatTnd(amountTnd))}
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError("");
            const result = await startDepositAction(registrationId);
            if (result.ok) window.location.assign(result.payUrl);
            else setError(result.error);
          })
        }
        className="btn btn-primary mt-4 w-full justify-center disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {pending ? D.redirecting : <>{D.pay(formatTnd(amountTnd))} <Icon name="arrow" className="rtl:-scale-x-100" /></>}
      </button>
      {simulation && <p className="mt-2 text-[0.7rem] text-mist/80">{D.simulation}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    </div>
  );
}
