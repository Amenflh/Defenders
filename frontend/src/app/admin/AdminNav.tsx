"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Demandes", exact: true },
  { href: "/admin/formations", label: "Formations" },
  { href: "/admin/medias", label: "Médias" },
];

/** Onglets de l'espace admin. */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Espace admin" className="container-site mb-10 flex flex-wrap items-center gap-2 border-b border-line pb-4">
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`px-4 py-2 font-display text-sm tracking-[0.14em] uppercase transition-colors ${
              active ? "bg-gold text-ink" : "text-mist hover:text-bone"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
