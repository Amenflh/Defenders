import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { AcademyVideoHero } from "@/components/AcademyVideoHero";
import { AcademyProgrammes } from "@/components/AcademyBlocks";
import { Reveal } from "@/components/Reveal";
import { getHeroClips } from "@/lib/home-page-data";
import { getDictionary } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.formationsList.title, description: t.pages.formationsList.metaDescription };
}

export default async function FormationsPage({ searchParams }: PageProps<"/formations">) {
  await connection();
  const [{ locale, t }, params, heroClips] = await Promise.all([
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
    },
    en: {
      filterAcademy: "Filter by academy",
      allAcademies: "All academies",
      fitnessIntro: "Pilates, football coaching or Personal Training: choose your speciality. Open a course to review its content, available videos and practical details.",
      tsaIntro: "Explore Initial Response, Close Protection and K9 training. Review each course and contact TSA to confirm upcoming arrangements.",
    },
    ar: {
      filterAcademy: "تصفية حسب الأكاديمية",
      allAcademies: "كل الأكاديميات",
      fitnessIntro: "اختر اختصاصك: Pilates أو تدريب كرة القدم أو التدريب الشخصي. افتح كل تكوين للاطلاع على المحتوى والفيديوهات والتفاصيل العملية.",
      tsaIntro: "اكتشف مسارات التدخل الأولي والحماية القريبة وتكوين K9. اطّلع على كل صفحة وتواصل مع TSA للتثبت من الترتيبات القادمة.",
    },
  }[locale];
  const fitness = site.branches.find((branch) => branch.key === "fitness")!;
  const tsa = site.branches.find((branch) => branch.key === "tsa")!;
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
          <AcademyProgrammes academy="fitness" priority />
        </AcademySection>}

        {(activeAcademy === "all" || activeAcademy === "tsa") && <AcademySection branch={tsa} intro={copy.tsaIntro}>
          <AcademyProgrammes academy="tsa" />
        </AcademySection>}

      </div>
    </div>
  );
}

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
