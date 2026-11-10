"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, flagUrl, PRIORITY_COUNTRIES, type Country } from "@/lib/countries";
import { useI18n } from "@/lib/i18n/client";

/** Sépare un numéro complet (« +216 22 333 444 ») en pays + numéro local. */
function splitPhone(value: string): { country: Country; local: string } {
  const tunisia = COUNTRIES[0];
  const digits = value.replace(/[^\d+]/g, "");
  if (!digits.startsWith("+") && !digits.startsWith("00")) return { country: tunisia, local: value };
  const international = digits.replace(/^(\+|00)/, "");
  // L'indicatif le plus long qui correspond (ex. 216 plutôt que 2).
  const match = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => international.startsWith(c.dial));
  if (!match) return { country: tunisia, local: value };
  return { country: match, local: value.replace(/^\s*(\+|00)\s*/, "").slice(match.dial.length).trim() };
}

/**
 * Champ téléphone avec liste des pays (drapeau + indicatif).
 * La valeur envoyée (champ caché `name`) est le numéro international complet : « +216 22 333 444 ».
 */
export function PhoneField({ name, label, required, defaultValue = "", error }: { name: string; label: string; required?: boolean; defaultValue?: string; error?: string }) {
  const { locale, t } = useI18n();
  const initial = useMemo(() => splitPhone(defaultValue), [defaultValue]);
  const [country, setCountry] = useState<Country>(initial.country);
  const [local, setLocal] = useState(initial.local);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = `f-${name}`;

  const names = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);
  const countryName = (c: Country) => names?.of(c.iso.toUpperCase()) ?? c.iso.toUpperCase();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    const sorted = [
      ...PRIORITY_COUNTRIES.map((iso) => COUNTRIES.find((c) => c.iso === iso)!).filter(Boolean),
      ...COUNTRIES.filter((c) => !PRIORITY_COUNTRIES.includes(c.iso)).sort((a, b) => countryName(a).localeCompare(countryName(b), locale)),
    ];
    return q ? sorted.filter((c) => countryName(c).toLowerCase().includes(q) || c.dial.startsWith(q) || c.iso === q) : sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, names, locale]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDown = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const full = local.trim() ? `+${country.dial} ${local.trim()}` : "";

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm text-mist">
        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}
      </label>
      <input type="hidden" name={name} value={full} />
      {/* Numéro toujours saisi de gauche à droite, même en arabe. */}
      <div dir="ltr" className={`flex border bg-ink focus-within:border-gold ${error ? "border-red-500/70" : "border-line"}`}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${t.form.country} : ${countryName(country)} (+${country.dial})`}
          className="flex shrink-0 items-center gap-2 border-r border-line px-3 text-sm text-bone hover:bg-ink-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(country.iso)} alt="" width={22} height={16} className="h-4 w-[22px] object-cover" />
          <span>+{country.dial}</span>
          <span aria-hidden="true" className="text-[0.6rem] text-mist">▼</span>
        </button>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          value={local}
          onChange={(e) => {
            const value = e.target.value;
            // Numéro collé au format international : le pays est détecté automatiquement.
            if (/^\s*(\+|00)/.test(value)) {
              const parsed = splitPhone(value);
              setCountry(parsed.country);
              setLocal(parsed.local);
            } else setLocal(value);
          }}
          placeholder="22 333 444"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-bone placeholder:text-mist/50 focus:outline-none"
        />
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 border border-line bg-ink-2 shadow-2xl">
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.form.searchCountry}
            aria-label={t.form.searchCountry}
            className="w-full border-b border-line bg-ink px-4 py-2.5 text-sm text-bone placeholder:text-mist/60 focus:outline-none"
          />
          <ul role="listbox" aria-label={t.form.country} className="max-h-64 overflow-y-auto py-1">
            {list.map((c, i) => (
              <li key={c.iso} role="option" aria-selected={c.iso === country.iso}>
                <button
                  type="button"
                  onClick={() => {
                    setCountry(c);
                    setOpen(false);
                    setQuery("");
                    document.getElementById(id)?.focus();
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-start text-sm hover:bg-ink-3 ${c.iso === country.iso ? "text-gold" : "text-bone"} ${!query && i === PRIORITY_COUNTRIES.length - 1 ? "border-b border-line" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flagUrl(c.iso)} alt="" width={22} height={16} loading="lazy" className="h-4 w-[22px] shrink-0 object-cover" />
                  <span className="flex-1 truncate">{countryName(c)}</span>
                  <span dir="ltr" className="text-mist">+{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm text-red-300">{error}</p>}
    </div>
  );
}
