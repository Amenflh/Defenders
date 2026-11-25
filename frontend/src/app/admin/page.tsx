import { apiFetch } from "@/lib/session";
import { AdminDashboard } from "./AdminDashboard";
import type { AdminStats } from "./actions";
import { getAdminSettings, getContactRequests, getSecurityQuotes } from "./shell-data";

type Props = React.ComponentProps<typeof AdminDashboard>;

/** Lecture JSON tolérante : une rubrique indisponible n'empêche pas d'afficher les autres. */
async function load<T>(path: string): Promise<T | null> {
  const res = await apiFetch(path).catch(() => null);
  return res?.ok ? ((await res.json()) as T) : null;
}

export default async function AdminPage() {
  const [contacts, quotes, settings, stats, formations, cms] = await Promise.all([
    getContactRequests(),
    getSecurityQuotes(),
    getAdminSettings(),
    load<AdminStats>("/api/admin/stats?days=30"),
    load<{ formations: Props["formations"] }>("/api/admin/formations"),
    load<{ items: Props["cms"] }>("/api/admin/cms/all"),
  ]);

  return (
    <AdminDashboard
      stats={stats}
      formations={formations?.formations ?? []}
      cms={cms?.items ?? []}
      contacts={contacts}
      securityQuotes={quotes ?? []}
      securityQuotesError={quotes ? undefined : "Les demandes de devis sécurité n'ont pas pu être chargées. Vérifiez la migration de la base et réessayez."}
      initialSettings={settings}
    />
  );
}
