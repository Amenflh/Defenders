import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import { HomeHeroVideo } from "@/components/HomeHeroVideo";
import { Icon } from "./Icon";

export function AcademyVideoHero({
  eyebrow,
  title,
  intro,
  videoSrc,
  poster,
  logo,
  logoAlt,
  coursesLabel,
  showLogo = true,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  videoSrc?: string;
  poster: string | StaticImageData;
  logo: string;
  logoAlt: string;
  coursesLabel: string;
  showLogo?: boolean;
}) {
  return (
    <section className="relative isolate flex min-h-[68svh] items-center overflow-hidden border-b border-line">
      <HomeHeroVideo src={videoSrc} poster={typeof poster === "string" ? poster : poster.src} />
      <div className="absolute inset-0 -z-10 bg-ink/60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 via-ink/45 to-ink" />
      <div className="container-site py-20 sm:py-24">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <div className="flex items-center gap-4">
            {showLogo && <Image src={logo} alt={logoAlt} width={72} height={72} className="size-14 shrink-0 rounded-full bg-white object-contain p-1 ring-1 ring-white/50 sm:size-[4.5rem]" />}
            <h1 className="heading-xl">{title}</h1>
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bone/85 sm:text-xl">{intro}</p>
          <Link href="#programmes" className="btn btn-primary mt-8">
            {coursesLabel} <Icon name="arrow" className="rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
      <a href="#programmes" aria-label={coursesLabel} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center text-gold sm:flex">
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
      </a>
    </section>
  );
}
