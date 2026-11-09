import { redirect } from "next/navigation";
import { apiFetch, getCurrentUser } from "@/lib/session";
import { AdminDashboard } from "./AdminDashboard";
import type { AdminStats } from "./actions";

type Contact = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  profile: string;
  trainings: string[];
  availability: string;
  message: string;
  status: string;
};

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const user = await getCurrentUser();
  if (user === "unavailable" || user === null) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="heading-lg">Espace admin</h1>
        <p className="mt-4 text-mist">L&apos;API ne répond pas. Vérifiez que le backend et PostgreSQL sont démarrés.</p>
      </section>
    );
  }

  const { tab } = await searchParams;
  const res = await apiFetch("/api/admin/contacts");
  if (res.status === 401) redirect("/login?next=/admin");
  const data = res.ok ? ((await res.json()) as { contacts: Contact[] }) : null;
  const [statsRes, formationsRes, mediaRes, cmsRes, settingsRes, unreadRes] = await Promise.all([
    apiFetch("/api/admin/stats?days=30"),
    apiFetch("/api/admin/formations"),
    apiFetch("/api/admin/media"),
    apiFetch("/api/admin/cms/all"),
    apiFetch("/api/admin/settings/site"),
    apiFetch("/api/admin/chat/unread"),
  ]);
  const unreadMessages = unreadRes.ok ? ((await unreadRes.json()) as { unread: number }).unread : 0;
  const stats = statsRes.ok ? ((await statsRes.json()) as AdminStats) : null;
  const formations = formationsRes.ok ? ((await formationsRes.json()) as { formations: React.ComponentProps<typeof AdminDashboard>["formations"] }).formations : [];
  const media = mediaRes.ok ? ((await mediaRes.json()) as { media: React.ComponentProps<typeof AdminDashboard>["media"] }).media : [];
  const cms = cmsRes.ok ? ((await cmsRes.json()) as { items: React.ComponentProps<typeof AdminDashboard>["cms"] }).items : [];
  const settings = settingsRes.ok ? ((await settingsRes.json()) as { value: Record<string, unknown> }).value : {};

  return (
    <AdminDashboard
      initialTab={typeof tab === "string" ? tab : undefined}
      initialUnreadMessages={unreadMessages}
      stats={stats}
      formations={formations}
      media={media}
      cms={cms}
      contacts={data?.contacts ?? []}
      initialSettings={settings}
      userName={typeof user === "object" ? user.name : ""}
      userEmail={typeof user === "object" ? user.email : ""}
    />
  );
}
