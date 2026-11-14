import Link from "next/link";
import type { ReactNode } from "react";
import { HomeHeroVideo } from "@/components/HomeHeroVideo";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { RotatingWord } from "@/components/RotatingWord";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";

type Props = {
  order: number;
  enabled: boolean;
  videoSrc?: string;
  poster: string;
  certificationLabel: string;
  approval: string;
  brandName: string;
  brandDescriptor: string;
  description: string;
  lead: string;
  formationNames: string[];
  t: Dictionary;
  contactButton: ReactNode;
};

export function HomeHero({
  order,
  enabled,
  videoSrc,
  poster,
  certificationLabel,
  approval,
  brandName,
  brandDescriptor,
  description,
  lead,
  formationNames,
  t,
  contactButton,
}: Props) {
  return (
    <section
      style={{ order }}
      hidden={!enabled}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16"
    >
      <HomeHeroVideo src={videoSrc} poster={poster} />
      <div className="absolute inset-0 -z-10 bg-ink/65" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--color-gold)_12%,transparent)_0%,transparent_58%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/45 via-ink/60 to-ink" />

      <div className="container-site flex items-center">
        <div className="w-full max-w-5xl">
          <Reveal>
            <p className="mb-6 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs tracking-[0.2em] text-gold-soft uppercase">
              <Icon name="shield" width={14} height={14} /> {certificationLabel} · {approval}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="heading-xl">
              {brandName}
              <br />
              <span className="text-transparent [-webkit-text-stroke:1.5px_var(--color-bone)]">{brandDescriptor}</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-xl whitespace-pre-line text-lg leading-relaxed text-mist sm:text-xl">
              {description}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-8 font-display text-2xl tracking-wide uppercase sm:text-3xl">
              {lead} <span className="text-gold"><RotatingWord words={formationNames.length ? formationNames : ["Pilates", "Football", "Personal Training"]} /></span>
            </p>
          </Reveal>
          <Reveal delay={350}>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={t.branches.title}>
              {site.branches.map((branch) => {
                const label = branch.comingSoon ? t.branches.comingSoon.title : branch.name;
                return (
                  <li key={branch.name}>
                    {branch.href ? (
                      <Link href={branch.href} className="inline-block border border-bone/25 bg-ink/40 px-3 py-1.5 text-[0.7rem] tracking-[0.14em] text-bone uppercase backdrop-blur-sm transition-colors hover:border-gold hover:text-gold">
                        {label}
                      </Link>
                    ) : (
                      <span className="inline-block border border-gold/40 bg-ink/40 px-3 py-1.5 text-[0.7rem] tracking-[0.14em] text-gold uppercase backdrop-blur-sm">
                        {label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal delay={400} className="mt-10 flex flex-wrap gap-4">
            <Link href="#formations" className="btn btn-primary">
              {t.home.ourFormations} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
            <Link href="/trouver-ma-formation" className="btn btn-ghost">
              <Icon name="star" /> {t.home.findFormation}
            </Link>
            {contactButton}
          </Reveal>
        </div>
      </div>

      <a
        href="#statistiques"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] tracking-[0.3em] text-mist uppercase sm:flex"
      >
        {t.home.scroll}
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
      </a>
    </section>
  );
}
