import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { brandIdentity } from "@/lib/settings";
import { AdminShell, type AdminNotification } from "./AdminShell";
import { getAdminSettings, getAdminUnread, getContactRequests, getSecurityQuotes } from "./shell-data";

export const metadata: Metadata = {
  title: "Espace admin",
  robots: { index: false, follow: false },
};

/** Réservé aux administrateurs : un client connecté est renvoyé vers l'accueil. Même en-tête et même menu sur toutes les pages. */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();
  if (user === null) redirect("/login?next=/admin");
  if (user !== "unavailable" && user.role !== "admin") redirect("/");

  if (user === "unavailable") {
    return (
      <main id="contenu" className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="heading-lg">Espace admin</h1>
        <p className="mt-4 text-mist">L&apos;API ne répond pas. Vérifiez que le backend et PostgreSQL sont démarrés.</p>
      </main>
    );
  }

  const [contacts, quotes, unread, settings] = await Promise.all([getContactRequests(), getSecurityQuotes(), getAdminUnread(), getAdminSettings()]);
  const inquiries = contacts.filter((contact) => contact.profile === "demande-info");
  const registrations = contacts.filter((contact) => contact.profile !== "demande-info");
  const latest = <T extends { createdAt: string }>(list: T[]) => [...list].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).at(0);
  const notifications = ([
    ["Dernière demande d'information", "demandes d'information", latest(inquiries)],
    ["Dernière inscription", "inscriptions", latest(registrations)],
    ["Dernier devis sécurité", "devis sécurité", latest(quotes ?? [])],
  ] as const).map(([label, tab, item]): AdminNotification => ({
    label,
    tab,
    item: item ? { name: `${item.firstName} ${item.lastName}`, createdAt: item.createdAt, status: item.status } : null,
  }));
  const { brandName, brandDescriptor, logoUrl } = brandIdentity(settings);

  return (
    <AdminShell
      user={{ name: user.name || "Administrateur", email: user.email }}
      identity={{ brandName, brandDescriptor, logoUrl }}
      counts={{ "demandes d'information": inquiries.length, inscriptions: registrations.length, "devis sécurité": quotes?.length ?? 0 }}
      newCount={[...contacts, ...(quotes ?? [])].filter((request) => request.status === "nouveau").length}
      notifications={notifications}
      initialUnread={unread}
    >
      {children}
    </AdminShell>
  );
}
