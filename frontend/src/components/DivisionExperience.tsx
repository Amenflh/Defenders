import Image from "next/image";
import Link from "next/link";
import { divisionActivities, divisionCopy, type DivisionKey } from "@/lib/division-copy";
import { historyFor } from "@/lib/history";
import type { Locale } from "@/lib/i18n/config";
import { pilatesPhotos } from "@/lib/images";
import { HistoryTimeline } from "./HistoryTimeline";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

export function DivisionExperience({ division, locale }: { division: DivisionKey; locale: Locale }) {
  const copy = divisionCopy[locale][division];
  const photos = division === "fitness" ? pilatesPhotos : [];

  return (
    <>
      <section id="galerie" className="scroll-mt-28 border-y border-line bg-ink-2 py-16 lg:py-20">
        <div className="container-site">
          <Reveal className="mb-9 max-w-3xl">
            <p className="eyebrow mb-3">{copy.galleryEyebrow}</p>
            <h2 className="heading-lg">{copy.galleryTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{photos.length ? copy.galleryText : copy.noGalleryText}</p>
          </Reveal>
          {photos.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <Reveal key={photo.src.src} delay={index * 70}>
                  <a href={photo.src.src} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] overflow-hidden border border-line bg-ink">
                    <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  </a>
                </Reveal>
              ))}
            </div>
          )}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {copy.sourceLinks.map((source, index) => (
              <Reveal key={source.href} delay={index * 50}>
                <a href={source.href} target="_blank" rel="noreferrer" className="flex min-h-16 items-center justify-between gap-4 border border-line bg-ink px-5 py-4 text-sm text-bone transition-colors hover:border-gold">
                  <span>{source.label}</span>
                  <Icon name="arrow" className="shrink-0 text-gold rtl:-scale-x-100" />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="historique" className="scroll-mt-28 py-16 lg:py-20">
        <div className="container-site">
          <Reveal className="mb-9 max-w-3xl">
            <p className="eyebrow mb-3">{copy.historyEyebrow}</p>
            <h2 className="heading-lg">{copy.historyTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{copy.historyText}</p>
          </Reveal>
          <HistoryTimeline entries={historyFor(divisionActivities[division])} />
          <Link href="/historique" className="mt-7 inline-flex items-center gap-2 font-display text-sm tracking-[0.12em] text-gold uppercase hover:text-bone">
            {locale === "fr" ? "Toutes les filières" : locale === "en" ? "All divisions" : "كل الفروع"}
            <Icon name="arrow" className="rtl:-scale-x-100" />
          </Link>
        </div>
      </section>

      <section id="temoignages" className="scroll-mt-28 border-y border-line bg-ink-2 py-16 lg:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{copy.reviewsEyebrow}</p>
            <h2 className="heading-lg">{copy.reviewsTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{copy.reviewsText}</p>
          </Reveal>
          <Reveal delay={100} className="border border-line bg-ink p-6 sm:p-8">
            <p className="leading-relaxed text-mist">{copy.reviewsEmpty}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
