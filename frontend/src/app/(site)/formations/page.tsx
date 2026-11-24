import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { AcademyVideoHero } from "@/components/AcademyVideoHero";
import { AcademyCourseCard } from "@/components/AcademyCourseCard";
import { FormationCard } from "@/components/FormationCard";
import { Reveal } from "@/components/Reveal";
import { Unavailable } from "@/components/Unavailable";
import { getFormations } from "@/lib/formations";
import { getHeroClips } from "@/lib/home-page-data";
import { getDictionary } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.formationsList.title, description: t.pages.formationsList.metaDescription };
}

export default async function FormationsPage({ searchParams }: PageProps<"/formations">) {
  await connection();
  const [formations, { locale, t }, params, heroClips] = await Promise.all([
    getFormations(),
    getDictionary(),
    searchParams,
    getHeroClips(),
  ]);
  const requestedAcademy = typeof params.academy === "string" ? params.academy : "";
  const activeAcademy = site.branches.some((branch) => branch.key === requestedAcademy) ? requestedAcademy : "all";
  const copy = {
    fr: {
      filterAcademy: "Filtrer par académie",
      allAcademies: "Toutes les académies",
      fitnessIntro: "Pilates, coaching football ou Personal Training : choisissez votre spécialité. Ouvrez chaque fiche pour voir le contenu, les vidéos disponibles et les modalités.",
      tsaIntro: "Découvrez les parcours en intervention initiale, protection rapprochée et formation K9. Consultez chaque fiche et contactez TSA pour confirmer les prochaines modalités.",
      details: "Voir les détails",
    },
    en: {
      filterAcademy: "Filter by academy",
      allAcademies: "All academies",
      fitnessIntro: "Pilates, football coaching or Personal Training: choose your speciality. Open a course to review its content, available videos and practical details.",
      tsaIntro: "Explore Initial Response, Close Protection and K9 training. Review each course and contact TSA to confirm upcoming arrangements.",
      details: "View course details",
    },
    ar: {
      filterAcademy: "تصفية حسب الأكاديمية",
      allAcademies: "كل الأكاديميات",
      fitnessIntro: "اختر اختصاصك: Pilates أو تدريب كرة القدم أو التدريب الشخصي. افتح كل تكوين للاطلاع على المحتوى والفيديوهات والتفاصيل العملية.",
      tsaIntro: "اكتشف مسارات التدخل الأولي والحماية القريبة وتكوين K9. اطّلع على كل صفحة وتواصل مع TSA للتثبت من الترتيبات القادمة.",
      details: "عرض التفاصيل",
    },
  }[locale];
  const fitness = site.branches.find((branch) => branch.key === "fitness")!;
  const tsa = site.branches.find((branch) => branch.key === "tsa")!;
  const tsaCopy = t.pages.akAcademy;
  const academyFilters = [
    { key: "all", label: copy.allAcademies },
    { key: "fitness", label: t.nav.fitnessAcademy },
    { key: "tsa", label: t.nav.akAcademy },
  ];
  return (
    <div className="branch-theme">
      <AcademyVideoHero
        eyebrow={t.pages.formationsList.eyebrow}
        title={t.pages.formationsList.title}
        intro={t.pages.formationsList.intro}
        clips={heroClips}
        poster="/pics/banner_images/banner18.jpeg"
        logo="/pics/logo-defenders-academy-round.png"
        logoAlt={site.name}
        coursesLabel={t.common.formations}
      />

      <div id="programmes" className="container-site pt-8">
        <p className="eyebrow mb-4">{copy.filterAcademy}</p>
        <nav aria-label={copy.filterAcademy} className="flex flex-wrap gap-2">
          {academyFilters.map(({ key, label }) => {
            const active = activeAcademy === key || (activeAcademy === "all" && key === "all");
            const href = key === "all" ? "/formations" : `/formations?academy=${key}`;
            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`border px-4 py-2 font-display text-xs tracking-[0.12em] uppercase transition-colors ${
                  active ? "border-gold bg-gold text-ink" : "border-line text-mist hover:border-gold hover:text-bone"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="container-site space-y-14 py-14 lg:space-y-20 lg:py-20">
        {(activeAcademy === "all" || activeAcademy === "fitness") && <AcademySection branch={fitness} intro={copy.fitnessIntro}>
          {formations === null ? (
            <Unavailable />
          ) : formations.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {formations.map((formation, index) => (
                <Reveal from={(["left", "up", "right"] as const)[index % 3]} key={formation.slug} delay={(index % 3) * 70}>
                <FormationCard
                  f={formation}
                  priority={index < 3}
                  videoUrl={fitnessCourseVideos[formation.slug]?.embedUrl}
                />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="border border-line bg-ink-2 p-6 text-mist">{t.pages.formationsList.emptyText}</p>
          )}
        </AcademySection>}

        {(activeAcademy === "all" || activeAcademy === "tsa") && <AcademySection branch={tsa} intro={copy.tsaIntro}>
          <div className="grid gap-5 lg:grid-cols-3">
            <AcademyCourseCard
              title={tsaCopy.courseTitle}
              text={tsaCopy.courseText}
              detail={tsaCopy.courseDuration}
              poster="/pics/partners/tsa-logo-eagle.jpg"
              videoEmbedUrl={site.tunisianSecurityAcademy.firstResponseVideos[0].embedUrl}
              videoLayout={site.tunisianSecurityAcademy.firstResponseVideos[0].layout}
              accentClassName="accent-intervention"
              href="/tunisian-security-academy/formations/intervention-initiale"
              action={copy.details}
            />
            <AcademyCourseCard
              title={tsaCopy.k9CourseTitle}
              text={tsaCopy.k9CourseText}
              detail={tsaCopy.k9CourseDuration}
              poster={site.tunisianSecurityAcademy.k9Poster}
              posterLayout="portrait"
              posterAlt={tsaCopy.k9PosterAlt}
              extraLink={{ href: site.tunisianSecurityAcademy.k9CoursePost, label: tsaCopy.k9CoursePostLink }}
              accentClassName="accent-k9"
              href="/tunisian-security-academy/formations/k9"
              action={copy.details}
            />
            <AcademyCourseCard
              title={tsaCopy.closeProtectionTitle}
              text={tsaCopy.closeProtectionText}
              detail={tsaCopy.durationToConfirm}
              poster="/pics/partners/tsa-logo-eagle.jpg"
              videoEmbedUrl={site.tunisianSecurityAcademy.closeProtectionVideos[0].embedUrl}
              videoLayout={site.tunisianSecurityAcademy.closeProtectionVideos[0].layout}
              accentClassName="accent-protection"
              href="/tunisian-security-academy/formations/protection-rapprochee"
              action={copy.details}
            />
          </div>
        </AcademySection>}

      </div>
    </div>
  );
}

const fitnessCourseVideos: Record<string, { embedUrl: string } | undefined> = {
  pilates: { embedUrl: site.facebook.pilatesVideoEmbeds[0] },
  football: { embedUrl: site.facebook.footballVideoEmbeds[0] },
  "personal-training": { embedUrl: site.facebook.personalTrainingVideoEmbeds[0] },
};

function AcademySection({
  branch,
  intro,
  children,
}: {
  branch: (typeof site.branches)[number];
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${branch.key}-formations`}>
      <Reveal from="left" className="mb-7 flex flex-wrap items-center gap-5">
        <Image
          src={branch.logo}
          alt=""
          width={72}
          height={72}
          className="size-16 shrink-0 rounded-full bg-white object-contain p-1 ring-1 ring-line sm:size-[4.5rem]"
        />
        <div>
          <p className="eyebrow mb-2">{branch.mark}</p>
          <h2 id={`${branch.key}-formations`} className="font-display text-2xl uppercase text-bone sm:text-3xl">
            {branch.name}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist sm:text-base">{intro}</p>
        </div>
      </Reveal>
      {children}
    </section>
  );
}
