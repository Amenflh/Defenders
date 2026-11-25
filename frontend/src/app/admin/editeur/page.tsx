import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { formationHref, type Academy } from "@/lib/academies";
import { apiFetch } from "@/lib/session";
import { VisualEditor, type EditorData, type EditorItem } from "./VisualEditor";

export const metadata: Metadata = { title: "Éditeur visuel · Espace admin" };

async function load<T>(path: string): Promise<T | null> {
  const res = await apiFetch(path).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin/editeur");
  return res?.ok ? ((await res.json()) as T) : null;
}

const PAGES = [
  { path: "/", label: "Accueil" },
  { path: "/fitness-academy", label: "Fitness Academy" },
  { path: "/tunisian-security-academy", label: "Tunisian Security Academy" },
  { path: "/formations", label: "Nos formations" },
  { path: "/historique", label: "Historique" },
  { path: "/planning", label: "Planning" },
  { path: "/contact", label: "Contact et inscription" },
  { path: "/trouver-ma-formation", label: "Quiz d'orientation" },
  { path: "/reglement-interieur", label: "Règlement intérieur" },
  { path: "/mentions-legales", label: "Mentions légales" },
  { path: "/politique-de-confidentialite", label: "Confidentialité" },
  { path: "/cookies", label: "Cookies" },
];

/** Modifier le site directement sur ses pages. */
export default async function VisualEditorPage() {
  const [formations, history, trainers, cms, media, settings, texts] = await Promise.all([
    load<{ formations: EditorItem[] }>("/api/admin/formations"),
    load<{ entries: EditorItem[] }>("/api/admin/history"),
    load<{ trainers: EditorItem[] }>("/api/admin/trainers"),
    load<{ items: EditorItem[] }>("/api/admin/cms/all"),
    load<{ media: EditorItem[] }>("/api/admin/media"),
    load<{ value: Record<string, unknown> }>("/api/admin/settings/site"),
    load<{ value: EditorData["texts"] }>("/api/admin/settings/texts"),
  ]);

  if (!formations || !history || !trainers || !cms || !media || !settings || !texts) {
    return <p role="alert" className="border border-red-400/40 bg-red-500/10 p-6 text-red-200">Impossible de charger le contenu : l&apos;API ne répond pas.</p>;
  }
  const published = formations.formations.filter((f) => f.status === "published");
  return (
    <VisualEditor
      pages={[...PAGES, ...published.map((f) => ({ path: formationHref({ slug: String(f.slug), academy: f.academy as Academy }), label: `Formation · ${String(f.name)}` }))]}
      data={{ formations: formations.formations, history: history.entries, trainers: trainers.trainers, cms: cms.items, media: media.media, settings: settings.value, texts: texts.value }}
    />
  );
}
