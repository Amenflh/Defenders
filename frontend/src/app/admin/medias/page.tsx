import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";
import { MediaCard, type AdminMedia } from "./MediaCard";
import { MediaUploader } from "./MediaUploader";

export const metadata: Metadata = { title: "Médias · Espace admin" };

const FILTERS = [
  { value: undefined, label: "Tous" },
  { value: "image", label: "Images" },
  { value: "video", label: "Vidéos" },
] as const;

/** Téléversement et gestion des images et vidéos (#38, #39). */
export default async function AdminMediaPage({ searchParams }: PageProps<"/admin/medias">) {
  const { type } = await searchParams;
  const filter = type === "image" || type === "video" ? type : undefined;

  const [mediaRes, formationsRes] = await Promise.all([
    apiFetch(`/api/admin/media${filter ? `?type=${filter}` : ""}`).catch(() => null),
    apiFetch("/api/admin/formations").catch(() => null),
  ]);
  if (mediaRes?.status === 401) redirect("/login?next=/admin/medias");
  const media = mediaRes?.ok ? ((await mediaRes.json()) as { media: AdminMedia[] }).media : null;
  const formations = formationsRes?.ok
    ? ((await formationsRes.json()) as { formations: { id: number; name: string }[] }).formations.map(({ id, name }) => ({ id, name }))
    : [];

  return (
    <section className="container-site">
      <div className="mb-10">
        <p className="eyebrow mb-2">Espace admin</p>
        <h1 className="heading-lg">Médias</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">
          Images et vidéos des formations et de la galerie. Une image envoyée peut aussi servir de visuel principal à une
          formation (onglet Formations).
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[24rem_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="mb-4 font-display text-xl tracking-wide uppercase">Envoyer un fichier</h2>
          <MediaUploader formations={formations} />
        </div>

        <div>
          <nav aria-label="Filtrer par type" className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = f.value === filter;
              return (
                <Link
                  key={f.label}
                  href={f.value ? `/admin/medias?type=${f.value}` : "/admin/medias"}
                  aria-current={active ? "page" : undefined}
                  className={`border px-4 py-2 font-display text-sm tracking-[0.12em] uppercase ${active ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}
                >
                  {f.label}
                </Link>
              );
            })}
          </nav>

          {media === null ? (
            <p role="alert" className="border border-red-400/40 bg-red-500/10 p-6 text-red-200">Impossible de charger les médias : l&apos;API ne répond pas.</p>
          ) : media.length === 0 ? (
            <div className="border border-line bg-ink-2 p-10 text-center text-mist">Aucun média pour le moment. Envoyez votre premier fichier.</div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {media.map((m) => (
                <MediaCard key={m.id} m={m} formations={formations} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
