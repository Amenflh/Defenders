import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import { getDictionary } from "@/lib/i18n/server";
import { FacebookVideoEmbed } from "./FacebookVideoEmbed";
import type { FacebookVideoLayout } from "./FacebookVideoEmbed";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

export type AcademyProgram = {
  slug: string;
  title: string;
  eyebrow: string;
  duration: string;
  summary: string;
  topics: string[];
  practical: string;
  poster: string | StaticImageData;
  videoEmbeds?: readonly { url: string; layout: FacebookVideoLayout }[];
  contactHref?: string;
  contactLabel?: string;
};

export async function AcademyProgramPage({ program }: { program: AcademyProgram }) {
  const { t } = await getDictionary();
  const otherSlug = program.slug === "k9" ? "intervention-initiale" : "k9";
  const otherTitle = program.slug === "k9" ? t.pages.akAcademy.courseTitle : t.pages.akAcademy.k9CourseTitle;
  const accentClassName = program.slug === "k9"
    ? "accent-k9"
    : program.slug === "protection-rapprochee"
      ? "accent-protection"
      : "accent-intervention";

  return (
    <div className={`branch-theme ${accentClassName}`}>
      <section className="relative overflow-hidden border-b border-line pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="pointer-events-none absolute -top-40 -end-40 size-[36rem] rounded-full bg-gold opacity-10 blur-3xl" />
        <div className="container-site grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <nav aria-label={t.pages.formation.breadcrumb} className="mb-6 flex flex-wrap gap-2 text-xs tracking-[0.16em] text-mist uppercase">
                <Link href="/" className="hover:text-bone">{t.nav.home}</Link>
                <span aria-hidden="true">/</span>
                <Link href="/ak-tunisian-security-academy" className="hover:text-bone">{t.nav.akAcademy}</Link>
                <span aria-hidden="true">/</span>
                <span className="text-gold">{program.title}</span>
              </nav>
            </Reveal>
            <Reveal delay={60}>
              <p className="eyebrow mb-4">{program.eyebrow}</p>
              <h1 className="heading-xl">{program.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mist">{program.summary}</p>
            </Reveal>
            <Reveal delay={120}>
              <dl className="mt-8 inline-grid min-w-48 border-y border-line py-4">
                <dt className="text-xs tracking-[0.18em] text-mist uppercase">{t.pages.formation.duration}</dt>
                <dd className="mt-1 font-display text-xl uppercase text-gold">{program.duration}</dd>
              </dl>
            </Reveal>
            <Reveal delay={180} className="mt-8 flex flex-wrap gap-3">
              <Link href="/ak-tunisian-security-academy#inscription" className="btn btn-primary">
                {t.common.register} <Icon name="arrow" className="rtl:-scale-x-100" />
              </Link>
              <Link href="/ak-tunisian-security-academy#programmes" className="btn btn-ghost">
                {t.common.formations}
              </Link>
            </Reveal>
          </div>
          <Reveal from="right" delay={100} className="relative overflow-hidden border border-gold/40 bg-ink-2 p-2">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" aria-hidden="true" />
            <div className="relative aspect-[4/3] overflow-hidden bg-ink sm:aspect-video">
              <Image src={program.poster} alt="" fill unoptimized={typeof program.poster === "string"} sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain p-8" />
            </div>
            <p className="px-4 py-3 font-display text-xs tracking-[0.18em] text-gold uppercase">{program.eyebrow}</p>
          </Reveal>
        </div>
      </section>

      {program.videoEmbeds && program.videoEmbeds.length > 0 && (
        <section className="border-y border-line bg-ink-2 py-12 lg:py-16" aria-labelledby="program-videos-title">
          <div className="container-site">
            <Reveal className="mb-8">
              <p className="eyebrow mb-3">{program.eyebrow}</p>
              <h2 id="program-videos-title" className="heading-lg">{t.pages.formation.videoGalleryTitle}</h2>
            </Reveal>
            <div className={`grid items-start gap-6 ${program.videoEmbeds.length > 1 ? "md:grid-cols-2" : ""}`}>
              {program.videoEmbeds.map(({ url, layout }, index) => (
                <Reveal key={url} className="mx-auto w-full max-w-2xl overflow-hidden border border-line bg-black p-2">
                  <FacebookVideoEmbed url={url} layout={layout} title={`${program.title} ${index + 1}`} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-y border-line bg-ink-2 py-20 lg:py-24">
        <div className={`container-site grid gap-14 ${program.topics.length ? "lg:grid-cols-2" : ""}`}>
          <Reveal>
            <p className="eyebrow mb-3">{t.pages.formation.whatYouLearn}</p>
            <h2 className="heading-lg">{program.title}</h2>
            <p className="mt-6 border-s-2 border-gold bg-ink p-5 leading-relaxed text-mist">{program.practical}</p>
            {program.contactHref && program.contactLabel && (
              <a href={program.contactHref} className="mt-6 inline-flex items-center gap-2 border border-gold/40 px-4 py-3 text-sm text-gold transition-colors hover:bg-gold hover:text-ink">
                <Icon name="phone" /> {program.contactLabel}
              </a>
            )}
          </Reveal>
          {program.topics.length > 0 && (
            <Reveal delay={120}>
              <p className="eyebrow mb-3">{t.pages.formation.programme}</p>
              <h2 className="heading-lg mb-8">{t.pages.formation.objectives}</h2>
              <ol className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
                {program.topics.map((topic, index) => (
                  <li key={topic} className="min-h-36 bg-ink p-6 transition-colors hover:bg-ink-3 sm:p-7">
                    <span className="font-display text-sm tracking-[0.3em] text-gold">{String(index + 1).padStart(2, "0")}</span>
                    <p className="mt-4 font-display text-lg uppercase text-bone">{topic}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container-site flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="eyebrow mb-2">{t.pages.formation.discoverAlso}</p>
            <h2 className="font-display text-2xl uppercase">{otherTitle}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/ak-tunisian-security-academy/formations/${otherSlug}`} className="btn btn-primary">
              {t.pages.formation.discover} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
            <Link href="/historique?academy=tsa" className="btn btn-ghost">
              {t.history.seeAll}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
