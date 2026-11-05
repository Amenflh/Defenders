"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminNav } from "./AdminNav";

/**
 * Le tableau de bord (/admin) a sa propre mise en page (barre latérale, en-tête, <main>).
 * Les sous-pages (formations, médias) reçoivent les onglets et leur zone principale.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin") return <>{children}</>;
  return (
    <main id="contenu" className="min-h-dvh pt-8 pb-20">
      <div className="container-site mb-4">
        <Link href="/admin" className="text-xs tracking-[0.14em] text-mist uppercase hover:text-gold">
          ← Tableau de bord
        </Link>
      </div>
      <AdminNav />
      {children}
    </main>
  );
}
