"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { formatTnd } from "@/lib/program";
import { startDepositAction } from "./actions";

/** « Payer l'acompte » : crée le paiement puis envoie le stagiaire sur la page sécurisée du prestataire. */
export function DepositButton({ registrationId, amountTnd, simulation }: { registrationId: string; amountTnd: number; simulation?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="mt-5 border-t border-line pt-5">
      <p className="text-sm text-bone">Réservez votre place dès maintenant</p>
      <p className="mt-1 text-xs text-mist">
        Acompte de {formatTnd(amountTnd)} par carte bancaire, wallet ou e-DINAR — déduit du prix de la formation.
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
        {pending ? "Redirection vers le paiement…" : <>Payer l&apos;acompte · {formatTnd(amountTnd)} <Icon name="arrow" /></>}
      </button>
      {simulation && <p className="mt-2 text-[0.7rem] text-mist/80">Mode simulation (développement) : aucun paiement réel.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    </div>
  );
}
