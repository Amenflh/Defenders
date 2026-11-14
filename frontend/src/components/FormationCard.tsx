import { accentClassFor, visualFor } from "@/lib/formation-visuals";
import { formatPrice, type Formation } from "@/lib/formations";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { AcademyCourseCard } from "./AcademyCourseCard";

/** Carte d'une formation avec son aperçu vidéo quand une source officielle existe. */
export async function FormationCard({
  f: source,
  priority = false,
  videoUrl,
}: {
  f: Formation;
  priority?: boolean;
  videoUrl?: string;
}) {
  const { locale, t } = await getDictionary();
  const f = localizeFormation(source, locale);
  const { cover } = visualFor(f.slug);
  const details = [f.durationLabel, f.levelLabel, formatPrice(f.priceTnd)].filter(Boolean).join(" · ");

  return (
    <AcademyCourseCard
      title={f.name}
      text={f.summary}
      detail={details}
      href={`/formations/${f.slug}`}
      action={t.pages.formation.discover}
      poster={f.coverUrl ?? cover.src}
      videoEmbedUrl={videoUrl}
      videoLayout="portrait"
      accentClassName={accentClassFor(f.slug)}
      priority={priority}
    />
  );
}
