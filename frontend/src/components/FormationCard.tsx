import { formationHref } from "@/lib/academies";
import { accentClassFor, visualFor } from "@/lib/formation-visuals";
import { formatPrice, type Formation } from "@/lib/formations";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { AcademyCourseCard } from "./AcademyCourseCard";

/** Carte d'une formation (les deux académies) : première vidéo, sinon visuel ou affiche. */
export async function FormationCard({
  f: source,
  priority = false,
}: {
  f: Formation;
  priority?: boolean;
}) {
  const { locale, t } = await getDictionary();
  const f = localizeFormation(source, locale);
  const { cover } = visualFor(f.accent);
  const [video] = f.videos;
  const details = [f.durationLabel, f.location, f.levelLabel, formatPrice(f.priceTnd)].filter(Boolean).join(" · ");

  return (
    <AcademyCourseCard
      title={f.name}
      text={f.summary}
      detail={details || t.pages.formation.onRequest}
      href={formationHref(f)}
      action={t.pages.formation.discover}
      poster={f.coverUrl ?? cover.src}
      posterAlt={f.coverIsPoster ? t.pages.formation.imageAlt(f.name) : ""}
      posterLayout={f.coverIsPoster ? "portrait" : "landscape"}
      videoEmbedUrl={video?.url}
      videoLayout={video?.layout}
      accentClassName={accentClassFor(f.accent)}
      priority={priority}
      posterMotion={!f.coverIsPoster}
    />
  );
}
