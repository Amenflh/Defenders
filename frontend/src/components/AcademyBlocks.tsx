import Image from "next/image";
import Link from "next/link";
import type { Academy } from "@/lib/academies";
import { getGallery, getSiteMedia, getTeam } from "@/lib/academy-content";
import { getFormations } from "@/lib/formations";
import { getDictionary } from "@/lib/i18n/server";
import { getCmsItems } from "@/lib/settings";
import { courseGrid, courseSlot } from "./AcademyCourseCard";
import { FormationCard } from "./FormationCard";
import { GalleryMarquee } from "./GalleryMarquee";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { TrainerCards } from "./TrainerCards";
import { Unavailable } from "./Unavailable";
import { VideoEmbed } from "./VideoEmbed";

/*
 * Blocs communs aux pages des deux académies : mêmes rubriques, même ordre, tout le contenu vient de l'admin
 * (Formations, Équipe, Médias, Contenus, Historique).
 */

const FROM = ["left", "up", "right"] as const;
const columns = (count: number) =>
  count === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : count === 2 ? "sm:grid-cols-2" : count === 1 ? "mx-auto max-w-md" : "sm:grid-cols-2 lg:grid-cols-3";

/** Cartes des formations publiées d'une académie. */
export async function AcademyProgrammes({ academy, priority = false }: { academy: Academy; priority?: boolean }) {
  const [formations, { t }] = await Promise.all([getFormations(academy), getDictionary()]);
  if (formations === null) return <Unavailable />;
  if (formations.length === 0) return <p className="border border-line bg-ink-2 p-6 text-mist">{t.pages.formationsList.emptyText}</p>;
  return (
    <div className={`${courseGrid} ${columns(formations.length)}`}>
      {formations.map((formation, index) => (
        <Reveal key={formation.slug} from={FROM[index % 3]} delay={(index % 4) * 70} className={courseSlot}>
          <FormationCard f={formation} priority={priority && index < 3} />
        </Reveal>
      ))}
    </div>
  );
}

/** Équipe pédagogique : présentation de l'académie puis les formateurs saisis dans l'admin. */
export async function AcademyTeam({ academy }: { academy: Academy }) {
  const [team, { t }] = await Promise.all([getTeam(academy), getDictionary()]);
  const S = academy === "tsa" ? t.pages.akAcademy : t.pages.fitnessAcademy;
  return (
    <section id="equipe" className="scroll-mt-28 py-16 lg:py-24">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal from="left">
            <p className="eyebrow mb-3">{S.trainersEyebrow}</p>
            <h2 className="heading-lg">{S.trainersTitle}</h2>
          </Reveal>
          <Reveal from="right" delay={100} className="border-s-2 border-gold bg-ink-2 p-6 sm:p-8">
            <p className="leading-relaxed text-mist">{S.trainersText}</p>
          </Reveal>
        </div>
        {team.length > 0 && (
          <TrainerCards trainers={team} className="mt-10" />
        )}
      </div>
    </section>
  );
}

/** Galerie de l'académie : photos défilantes puis vidéos, dans des cadres identiques. */
export async function AcademyGallery({ academy, copy, links }: {
  academy: Academy;
  copy: { eyebrow: string; title: string; text: string };
  links: { href: string; label: string; icon: "facebook" | "instagram" | "play" }[];
}) {
  const [{ photos, videos }, { t }] = await Promise.all([getGallery(academy), getDictionary()]);
  return (
    <section id="galerie" className="scroll-mt-28 border-y border-line bg-ink-2 py-16 lg:py-24">
      <div className="container-site">
        <Reveal from="left" className="mb-9 max-w-3xl">
          <p className="eyebrow mb-3">{copy.eyebrow}</p>
          <h2 className="heading-lg">{copy.title}</h2>
          <p className="mt-4 leading-relaxed text-mist">{copy.text}</p>
        </Reveal>
      </div>
      {photos.length > 0 && (
        <Reveal from="left">
          <GalleryMarquee photos={photos} label={copy.title} />
        </Reveal>
      )}
      <div className="container-site">
        {videos.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {videos.map((video, index) => (
              <Reveal key={video.url} from={FROM[index % 3]} delay={(index % 4) * 80} className="video-card flex flex-col overflow-hidden border border-line bg-ink">
                <span className="h-1 w-full bg-gold" aria-hidden="true" />
                <div className="relative aspect-[9/16]">
                  <VideoEmbed url={video.url} layout={video.layout} fit="cover" title={video.title || `${copy.title} ${index + 1}`} />
                </div>
                {video.title && <p className="px-3 py-3 font-display text-xs uppercase text-gold-soft sm:px-4 sm:text-sm">{video.title}</p>}
              </Reveal>
            ))}
          </div>
        )}
        {photos.length === 0 && videos.length === 0 && (
          <p className="border border-dashed border-line bg-ink p-8 text-center text-mist">{t.pages.formationsList.galleryText}</p>
        )}
        <Reveal from="left" className="mt-8 flex flex-wrap gap-3">
          {links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Icon name={link.icon} /> {link.label}
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** Témoignages de l'académie : textes (admin › Contenus) et vidéos (admin › Médias). */
export async function AcademyTestimonials({ academy, copy }: {
  academy: Academy;
  copy: { eyebrow: string; title: string; text: string; empty: string };
}) {
  const { locale, t } = await getDictionary();
  const [all, videos] = await Promise.all([getCmsItems("testimonials", locale), getSiteMedia("temoignage", academy)]);
  const items = all.filter((item) => item.academy === null || item.academy === academy);
  return (
    <section id="temoignages" className="scroll-mt-28 py-16 lg:py-24">
      <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <Reveal from="left">
          <p className="eyebrow mb-3">{copy.eyebrow}</p>
          <h2 className="heading-lg">{copy.title}</h2>
          <p className="mt-4 leading-relaxed text-mist">{copy.text}</p>
        </Reveal>
        <Reveal from="right" delay={100} className="border-s-2 border-gold bg-ink-2 p-6 sm:p-8">
          <p className="leading-relaxed text-mist">{copy.empty}</p>
          <Link href="/contact" className="mt-5 inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] text-gold uppercase hover:text-bone">
            {t.home.writeUs} <Icon name="arrow" className="rtl:-scale-x-100" />
          </Link>
        </Reveal>
      </div>
      {videos.length > 0 && (
        <div className="container-site mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <Reveal key={video.id} from={FROM[index % 3]} delay={(index % 3) * 120} className="video-card mx-auto w-full max-w-[360px] border border-line bg-ink-2 p-2">
              <VideoEmbed url={video.url} title={video.title || t.home.testimonialVideo(index + 1)} />
            </Reveal>
          ))}
        </div>
      )}
      <TestimonialCards items={items} />
    </section>
  );
}

/** Témoignages écrits : photo, texte, auteur et lien éventuel. */
export function TestimonialCards({ items }: { items: { id: number; title: string; subtitle: string; body: string; imageUrl: string; linkUrl: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className={`container-site mt-6 grid gap-5 ${items.length === 1 ? "" : items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {items.map((item) => (
        <article key={item.id} className="card-hover flex flex-col border border-line bg-ink-2 p-6">
          <Icon name="star" className="text-gold" />
          <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-bone">{item.body}</blockquote>
          <div className="mt-5 flex items-center gap-3">
            {item.imageUrl && (
              <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-ink ring-1 ring-gold/40">
                <Image src={item.imageUrl} alt="" fill unoptimized={!item.imageUrl.startsWith("/pics/")} sizes="48px" className="object-cover" />
              </span>
            )}
            <div className="min-w-0">
              <p className="font-display text-sm uppercase text-gold">
                {item.linkUrl ? <a href={item.linkUrl} target={/^https?:/.test(item.linkUrl) ? "_blank" : undefined} rel="noreferrer" className="hover:text-bone">{item.title}</a> : item.title}
              </p>
              {item.subtitle && <p className="mt-1 text-xs text-mist">{item.subtitle}</p>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Renvoi vers l'historique de l'académie. */
export async function AcademyHistoryLink({ academy }: { academy: Academy }) {
  const { t } = await getDictionary();
  return (
    <section id="historique" className="scroll-mt-28 border-y border-line bg-ink-2 py-12">
      <div className="container-site flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="eyebrow mb-2">{t.nav.history}</p>
          <h2 className="font-display text-2xl uppercase">{t.history.title}</h2>
        </div>
        <Link href={`/historique?academy=${academy}`} className="btn btn-ghost">
          {t.history.seeAll} <Icon name="arrow" className="rtl:-scale-x-100" />
        </Link>
      </div>
    </section>
  );
}
