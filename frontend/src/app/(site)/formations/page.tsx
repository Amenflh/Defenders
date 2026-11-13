import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { FormationCard } from "@/components/FormationCard";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { Unavailable } from "@/components/Unavailable";
import { getFormations } from "@/lib/formations";
import { getDictionary } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.formationsList.title, description: t.pages.formationsList.metaDescription };
}

export default async function FormationsPage() {
  await connection();
  const [formations, { t }] = await Promise.all([getFormations(), getDictionary()]);
  const copy = {
    fr: {
      coursesEyebrow: "Parcours de formation",
      coursesTitle: "Choisir sa spécialité",
      coursesText: "Découvrez les programmes actuellement publiés. Les prochaines dates et les places disponibles sont à confirmer auprès de l'académie.",
      contact: "Demander des informations",
      catalogue: "Voir le catalogue complet",
    },
    en: {
      coursesEyebrow: "Training pathways",
      coursesTitle: "Choose your speciality",
      coursesText: "Explore the programmes currently published. Upcoming dates and availability must be confirmed with the academy.",
      contact: "Request information",
      catalogue: "View the full course catalogue",
    },
    ar: {
      coursesEyebrow: "مسارات التكوين",
      coursesTitle: "اختر اختصاصك",
      coursesText: "اكتشف البرامج المنشورة حاليًا. يجب التأكد من المواعيد القادمة والأماكن المتاحة لدى الأكاديمية.",
      contact: "طلب معلومات",
      catalogue: "عرض دليل التكوينات كاملًا",
    },
  }[locale];

  return (
    <div className="branch-theme-fitness">
      <PageIntro eyebrow={t.pages.formationsList.eyebrow} title={t.pages.formationsList.title}>
        {t.pages.formationsList.intro}
      </PageIntro>

      <section className="py-16 lg:py-20">
        <div className="container-site">
          <Reveal className="mb-9 flex max-w-4xl items-start gap-5">
            <Image src="/pics/logo.jpg" alt="Defenders Fitness Academy" width={76} height={76} className="size-16 shrink-0 rounded-full bg-white object-contain ring-1 ring-line sm:size-20" />
            <div>
              <p className="eyebrow mb-3">{copy.coursesEyebrow}</p>
              <h2 className="heading-lg">{copy.coursesTitle}</h2>
              <p className="mt-4 leading-relaxed text-mist">{copy.coursesText}</p>
            </div>
          </Reveal>
          {formations === null ? (
            <Unavailable />
          ) : formations.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {formations.map((formation, index) => (
                <Reveal key={formation.slug} delay={index * 70}>
                  <FormationCard f={formation} priority={index < 3} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="border border-line bg-ink-2 p-6 text-mist">{t.pages.formationsList.emptyText}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/formations/catalogue" className="btn btn-ghost">
              {copy.catalogue} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
            <Link href="/contact" className="btn btn-primary">
              {copy.contact} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ink-2 py-12">
        <div className="container-site flex flex-wrap items-center justify-between gap-5">
          <p className="max-w-2xl text-sm leading-relaxed text-mist">{site.approval}</p>
          <Link href="/planning" className="btn btn-ghost">
            {t.nav.planning} <Icon name="calendar" />
          </Link>
        </div>
      </section>
    </div>
  );
}
