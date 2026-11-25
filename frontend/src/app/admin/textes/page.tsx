import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";
import { TextsEditor } from "./TextsEditor";

export const metadata: Metadata = { title: "Textes du site · Espace admin" };

export default async function AdminTextsPage() {
  const res = await apiFetch("/api/admin/settings/texts").catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin/textes");
  const value = res?.ok ? ((await res.json()) as { value: React.ComponentProps<typeof TextsEditor>["initial"] }).value : null;

  return (
    <section className="container-site">
      <div className="mb-8">
        <p className="eyebrow mb-2">Espace admin</p>
        <h1 className="heading-lg">Textes du site</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">Tous les textes des pages, dans les trois langues. Les formations, l&apos;historique et l&apos;équipe se modifient dans leurs onglets.</p>
      </div>
      {value === null ? (
        <p role="alert" className="border border-red-400/40 bg-red-500/10 p-6 text-red-200">Impossible de charger les textes : l&apos;API ne répond pas.</p>
      ) : (
        <TextsEditor initial={value} />
      )}
    </section>
  );
}
