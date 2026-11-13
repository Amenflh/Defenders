"use client";

import { useMemo, useState, useTransition } from "react";
import { dateFmt } from "@/lib/labels";
import { updateSecurityQuoteStatusAction } from "./actions";

export type SecurityQuote = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  city: string;
  service: string;
  message: string;
  status: string;
};

const STATUSES: Record<string, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  devis_envoye: "Devis envoyé",
  gagne: "Gagné",
  perdu: "Perdu",
  archive: "Archivé",
};
const SERVICES: Record<string, string> = {
  gardiennage: "Gardiennage",
  evenementiel: "Sécurité événementielle",
  protection: "Protection rapprochée",
  formation: "Formation professionnelle",
  autre: "Autre demande",
};

export function SecurityQuotesManager({
  quotes,
  loadError,
}: {
  quotes: SecurityQuote[];
  loadError?: string;
}) {
  const [items, setItems] = useState(quotes);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items.filter((quote) => {
      const statusMatch = filter === "all" || quote.status === filter;
      const searchMatch = !search || [
        quote.firstName,
        quote.lastName,
        quote.companyName,
        quote.email,
        quote.phone,
        quote.city,
        SERVICES[quote.service] ?? quote.service,
        quote.message,
      ].join(" ").toLowerCase().includes(search);
      return statusMatch && searchMatch;
    });
  }, [filter, items, query]);

  const changeStatus = (id: string, nextStatus: string) => {
    const previous = items.find((quote) => quote.id === id)?.status;
    if (!previous || previous === nextStatus) return;
    setError(false);
    setItems((current) => current.map((quote) => quote.id === id ? { ...quote, status: nextStatus } : quote));
    startTransition(async () => {
      const result = await updateSecurityQuoteStatusAction(id, nextStatus);
      if (!result.ok) {
        setItems((current) => current.map((quote) => quote.id === id ? { ...quote, status: previous } : quote));
        setError(true);
      }
    });
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-gold">Defenders Security Protection</p>
          <h2 className="mt-2 font-display text-2xl uppercase text-bone">Demandes de devis</h2>
          <p className="mt-2 text-sm text-mist">Les demandes de cette filière restent séparées des inscriptions Fitness.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sr-only" htmlFor="security-quote-search">Rechercher une demande</label>
          <input id="security-quote-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher…" className="w-full border border-line bg-ink-2 px-4 py-3 text-sm text-bone outline-none placeholder:text-mist focus:border-gold" />
          <label className="sr-only" htmlFor="security-quote-filter">Filtrer par statut</label>
          <select id="security-quote-filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full border border-line bg-ink-2 px-3 py-3 text-sm text-bone">
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUSES).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
          </select>
        </div>
      </div>
      {loadError ? (
        <p role="alert" className="border border-red-500/50 bg-red-500/10 p-5 text-sm text-red-200">{loadError}</p>
      ) : visible.length === 0 ? (
        <p className="border border-line bg-ink-2 p-8 text-center text-mist">Aucune demande de devis ne correspond à ces filtres.</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((quote) => (
            <article key={quote.id} className="border border-line bg-ink-2 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-gold">{SERVICES[quote.service] ?? quote.service}</p>
                  <h3 className="mt-2 font-display text-xl uppercase text-bone">{quote.firstName} {quote.lastName}</h3>
                  <p className="mt-1 text-xs text-mist">{dateFmt.format(new Date(quote.createdAt))}</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-mist">
                  <span>Statut</span>
                  <select value={quote.status} disabled={pending} onChange={(event) => changeStatus(quote.id, event.target.value)} className="border border-line bg-ink px-3 py-2 text-bone focus:border-gold focus:outline-none disabled:opacity-60">
                    {Object.entries(STATUSES).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
                  </select>
                </label>
              </div>
              <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
                <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">E-mail</dt><dd className="mt-1 break-all"><a href={`mailto:${quote.email}`} className="hover:text-gold">{quote.email}</a></dd></div>
                <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Téléphone</dt><dd className="mt-1"><a href={`tel:${quote.phone.replace(/\s/g, "")}`} className="hover:text-gold">{quote.phone}</a></dd></div>
                {quote.companyName && <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Entreprise</dt><dd className="mt-1">{quote.companyName}</dd></div>}
                {quote.city && <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Ville</dt><dd className="mt-1">{quote.city}</dd></div>}
              </dl>
              <p className="mt-4 whitespace-pre-line border-s-2 border-gold/50 bg-ink px-4 py-3 text-sm leading-relaxed text-mist">{quote.message}</p>
            </article>
          ))}
        </div>
      )}
      {error && <p role="alert" className="mt-4 text-sm text-red-300">Le statut n&apos;a pas pu être enregistré. Réessayez.</p>}
    </section>
  );
}
