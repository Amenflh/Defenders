import type { Metadata } from "next";
import { connection } from "next/server";
import { PageIntro } from "@/components/PageIntro";
import { Unavailable } from "@/components/Unavailable";
import { visualFor } from "@/lib/formation-visuals";
import { formatPrice, getFormations } from "@/lib/formations";
import { FormationQuiz, type QuizFormation } from "./FormationQuiz";

export const metadata: Metadata = {
  title: "Trouver ma formation",
  description: "Répondez à 4 questions et découvrez la formation certifiante qui correspond à votre profil et à vos objectifs.",
};

/** Quiz d'orientation : recommande les formations publiées selon le profil, l'envie et l'objectif. */
export default async function FindFormationPage() {
  await connection();
  const formations = await getFormations();

  const options: QuizFormation[] = (formations ?? []).map((f) => {
    const { cover, accent } = visualFor(f.slug);
    return {
      slug: f.slug,
      name: f.name,
      headline: f.headline,
      summary: f.summary,
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
      <PageIntro eyebrow="Orientation" title="Trouver ma formation">
        Quatre questions, moins d&apos;une minute : nous vous indiquons la formation qui correspond le mieux à votre profil,
        puis vous pouvez vous inscrire directement.
      </PageIntro>
      <section className="py-16 lg:py-24">
        <div className="container-site">
          {formations === null ? <Unavailable what="les formations" /> : <FormationQuiz formations={options} />}
        </div>
      </section>
    </>
  );
}
