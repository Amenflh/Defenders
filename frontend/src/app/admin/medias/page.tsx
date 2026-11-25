import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";
import { MediaCard, type AdminMedia } from "./MediaCard";
import { MediaLinkForm, MediaUploader } from "./MediaUploader";
import { ACADEMIES, ACADEMY_NAME, MEDIA_CATEGORIES } from "@/lib/academies";

export const metadata: Metadata = { title: "Médias · Espace admin" };

const FILTERS = [
  { value: undefined, label: "Tous" },
  { value: "image", label: "Images" },
  { value: "video", label: "Vidéos" },
] as const;

/** Téléversement et gestion des images et vidéos (#38, #39). */
export default async function AdminMediaPage({ searchParams }: PageProps<"/admin/medias">) {
  const { type, academie, emplacement } = await searchParams;
  const filter = type === "image" || type === "video" ? type : undefined;
  const academy = ACADEMIES.find((a) => a === academie);
  const category = MEDIA_CATEGORIES.find((c) => c.value && c.value === emplacement)?.value;
  const query = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams(Object.entries({ type: filter, academie: academy, emplacement: category, ...changes }).filter((e): e is [string, string] => !!e[1]));
    return `/admin/medias${params.size ? `?${params}` : ""}`;
  };

  const [mediaRes, formationsRes] = await Promise.all([
    apiFetch(`/api/admin/media${filter ? `?type=${filter}` : ""}`).catch(() => null),
    apiFetch("/api/admin/formations").catch(() => null),
  ]);
  if (mediaRes?.status === 401) redirect("/login?next=/admin/medias");
  const all = mediaRes?.ok ? ((await mediaRes.json()) as { media: AdminMedia[] }).media : null;
  const media = all?.filter((m) => (!academy || m.academy === academy || m.academy === null) && (!category || m.category === category)) ?? null;
  const formations = formationsRes?.ok
    ? ((await formationsRes.json()) as { formations: { id: number; name: string }[] }).formations.map(({ id, name }) => ({ id, name }))
    : [];

  return (
    <section className="container-site">
      <div className="mb-10">
        <p className="eyebrow mb-2">Espace admin</p>
        <h1 className="heading-lg">Médias</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">
          Galeries des académies, témoignages vidéo, vidéos de fond et bandeau de l&apos;accueil. « Emplacement » et « Académie »
          décident où le média s&apos;affiche ; une image sert aussi de visuel à une formation.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[24rem_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="mb-4 font-display text-xl tracking-wide uppercase">Envoyer un fichier</h2>
          <MediaUploader formations={formations} />
          <h2 className="mt-8 mb-4 font-display text-xl tracking-wide uppercase">Ajouter par lien</h2>
          <MediaLinkForm />
        </div>

        <div>
          <nav aria-label="Filtrer par type" className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = f.value === filter;
              return (
                <Link
                  key={f.label}
                  href={query({ type: f.value })}
                  aria-current={active ? "page" : undefined}
                  className={`border px-4 py-2 font-display text-sm tracking-[0.12em] uppercase ${active ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}
                >
                  {f.label}
                </Link>
              );
            })}
          </nav>

          <nav aria-label="Filtrer par emplacement et académie" className="mb-6 flex flex-wrap gap-2 text-xs">
            {[{ value: undefined, label: "Toutes académies" }, ...ACADEMIES.map((a) => ({ value: a as string, label: ACADEMY_NAME[a] }))].map((f) => (
              <Link key={f.label} href={query({ academie: f.value })} aria-current={f.value === academy ? "page" : undefined} className={`border px-3 py-1.5 ${f.value === academy ? "border-gold text-gold" : "border-line text-mist hover:text-bone"}`}>{f.label}</Link>
            ))}
            {[{ value: undefined, label: "Tous emplacements" }, ...MEDIA_CATEGORIES.filter((c) => c.value).map((c) => ({ value: c.value as string, label: c.label }))].map((f) => (
              <Link key={f.label} href={query({ emplacement: f.value })} aria-current={f.value === category ? "page" : undefined} className={`border px-3 py-1.5 ${f.value === category ? "border-gold text-gold" : "border-line text-mist hover:text-bone"}`}>{f.label}</Link>
            ))}
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
