import type { Metadata } from "next";
import { connection } from "next/server";
import { PageIntro } from "@/components/PageIntro";
import { Unavailable } from "@/components/Unavailable";
import { visualFor } from "@/lib/formation-visuals";
import { formatPrice, getFormations } from "@/lib/formations";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { FormationQuiz, type QuizFormation } from "./FormationQuiz";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.quiz.title, description: t.pages.quiz.metaDescription };
}

/** Quiz d'orientation : recommande les formations publiées selon le profil, l'envie et l'objectif. */
export default async function FindFormationPage() {
  await connection();
  const [formations, { locale, t }] = await Promise.all([getFormations(), getDictionary()]);

  const options: QuizFormation[] = (formations ?? []).map((f) => {
    const { cover, accent } = visualFor(f.slug);
    // Textes affichés dans la langue du visiteur ; l'analyse des réponses se fait sur le contenu français d'origine.
    const shown = localizeFormation(f, locale);
    return {
      slug: f.slug,
      name: shown.name,
      headline: shown.headline,
      summary: shown.summary,
      text: [f.name, f.headline, f.summary, ...f.intro, ...f.objectives, ...f.audience, ...f.careers, ...f.modules.map((m) => `${m.title} ${m.text}`)].join(" "),
      details: [f.durationLabel, f.levelLabel, formatPrice(f.priceTnd)].filter(Boolean).join(" · "),
      coverUrl: f.coverUrl || null,
      cover: cover.src,
      accentBg: accent.bg,
      accentText: accent.text,
    };
  });

  return (
    <>
      <PageIntro eyebrow={t.pages.quiz.eyebrow} title={t.pages.quiz.title}>
        {t.pages.quiz.intro}
      </PageIntro>
      <section className="py-16 lg:py-24">
        <div className="container-site">
          {formations === null ? <Unavailable /> : <FormationQuiz formations={options} />}
        </div>
      </section>
    </>
  );
}
