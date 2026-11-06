"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { site } from "@/lib/site";

export type QuizFormation = {
  slug: string;
  name: string;
  headline: string;
  summary: string;
  /** Tout le contenu texte de la formation (programme, public, débouchés…), pour l'analyse des réponses. */
  text: string;
  details: string;
  coverUrl: string | null;
  cover: StaticImageData;
  accentBg: string;
  accentText: string;
};

type Option = { value: string; label: string; hint: string; keywords: string[]; slugs?: string[] };
type Question = { id: string; title: string; reason: string; weight: number; options: Option[] };

const QUESTIONS: Question[] = [
  {
    id: "envie",
    title: "Qu'est-ce qui vous attire le plus ?",
    reason: "votre centre d'intérêt",
    weight: 3,
    options: [
      { value: "corps", label: "Le corps en conscience", hint: "Posture, gainage, souplesse, respiration", keywords: ["pilates", "posture", "souplesse", "gainage", "respiration", "reformer", "mat", "renforcement profond"], slugs: ["pilates"] },
      { value: "terrain", label: "Le terrain et l'équipe", hint: "Préparation physique, joueurs, clubs", keywords: ["football", "terrain", "equipe", "joueur", "club", "preparation physique", "match"], slugs: ["football"] },
      { value: "coaching", label: "Le coaching individuel", hint: "Transformer le physique d'un client", keywords: ["personal", "coaching", "individuel", "client", "musculation", "transformation", "nutrition", "programme personnalise"], slugs: ["personal-training"] },
      { value: "indecis", label: "Je ne sais pas encore", hint: "Montrez-moi ce qui me correspond", keywords: [] },
    ],
  },
  {
    id: "profil",
    title: "Où en êtes-vous aujourd'hui ?",
    reason: "votre profil",
    weight: 1,
    options: [
      { value: "coach-pro", label: "Coach en activité", hint: "Je veux me spécialiser", keywords: ["perfectionnement", "specialis", "avance", "experience", "professionnel"] },
      { value: "jeune-diplome", label: "Jeune diplômé", hint: "Sciences du sport, STAPS…", keywords: ["diplome", "certifi", "carriere", "insertion"] },
      { value: "etudiant", label: "Étudiant", hint: "Je prépare mon avenir", keywords: ["debutant", "etudiant", "bases", "fondamentaux"] },
      { value: "reconversion", label: "En reconversion", hint: "Je veux devenir coach", keywords: ["reconversion", "debutant", "tous niveaux", "devenir", "fondamentaux"] },
    ],
  },
  {
    id: "objectif",
    title: "Quel est votre objectif principal ?",
    reason: "votre objectif",
    weight: 2,
    options: [
      { value: "certificat", label: "Obtenir un certificat", hint: "Pour exercer officiellement", keywords: ["certifi", "diplome", "attestation", "agrement", "certificat"] },
      { value: "etranger", label: "Travailler à l'étranger", hint: "Avec nos partenaires recrutement", keywords: ["etranger", "international", "recrutement", "emploi", "debouche"] },
      { value: "competences", label: "Monter en compétences", hint: "Méthodes et outils concrets", keywords: ["competence", "methode", "technique", "pratique", "outil"] },
      { value: "activite", label: "Lancer mon activité", hint: "Coach indépendant, studio, salle", keywords: ["independant", "clientele", "activite", "salle", "studio", "entreprise"] },
    ],
  },
  {
    id: "rythme",
    title: "Quel rythme vous convient ?",
    reason: "votre disponibilité",
    weight: 1,
    options: [
      { value: "intensif", label: "Session intensive", hint: "Quelques jours, à plein temps", keywords: ["intensi", "jours", "immersion"] },
      { value: "semaine", label: "En semaine", hint: "Du lundi au vendredi", keywords: ["semaine"] },
      { value: "week-end", label: "Le week-end", hint: "Compatible avec un emploi", keywords: ["week-end", "weekend", "samedi"] },
      { value: "soir", label: "En soirée", hint: "Après le travail", keywords: ["soir", "soiree"] },
    ],
  },
];

/** Minuscules sans accents, pour comparer le contenu saisi dans l'admin aux mots-clés. */
const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

type Result = { formation: QuizFormation; score: number; reasons: string[] };

function rank(formations: QuizFormation[], answers: Record<string, string>): Result[] {
  return formations
    .map((formation) => {
      const text = normalize(formation.text);
      let score = 0;
      const reasons: string[] = [];
      for (const q of QUESTIONS) {
        const option = q.options.find((o) => o.value === answers[q.id]);
        if (!option) continue;
        const hits = Math.min(3, option.keywords.filter((k) => text.includes(k)).length);
        const direct = option.slugs?.includes(formation.slug) ? 4 : 0;
        if (hits + direct > 0) {
          score += q.weight * (hits + direct);
          reasons.push(q.reason);
        }
      }
      return { formation, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export function FormationQuiz({ formations }: { formations: QuizFormation[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const titleRef = useRef<HTMLHeadingElement>(null);
  const done = step >= QUESTIONS.length;
  const results = useMemo(() => (done ? rank(formations, answers) : []), [done, formations, answers]);

  const choose = (questionId: string, value: string) => {
    setAnswers((a) => ({ ...a, [questionId]: value }));
    // Petit délai : l'option choisie s'affiche sélectionnée avant de passer à la suite.
    setTimeout(() => {
      setStep((s) => s + 1);
      titleRef.current?.focus();
    }, 180);
  };
  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  if (formations.length === 0) {
    return (
      <div className="border border-line bg-ink-2 p-10 text-center">
        <h2 className="font-display text-2xl uppercase">Nouvelles sessions en préparation</h2>
        <p className="mx-auto mt-3 max-w-md text-mist">Aucune formation n&apos;est ouverte pour le moment. Contactez-nous pour être informé des prochaines dates.</p>
        <Link href="/contact" className="btn btn-primary mt-6">Nous contacter</Link>
      </div>
    );
  }

  const progress = Math.round((Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10">
        <div className="mb-3 flex justify-between text-xs tracking-[0.18em] text-mist uppercase">
          <span>{done ? "Vos résultats" : `Question ${step + 1} sur ${QUESTIONS.length}`}</span>
          <span>{progress} %</span>
        </div>
        <div className="h-1 bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progression du questionnaire">
          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {!done ? (
        <QuestionStep
          key={QUESTIONS[step].id}
          question={QUESTIONS[step]}
          selected={answers[QUESTIONS[step].id]}
          onChoose={(v) => choose(QUESTIONS[step].id, v)}
          onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
          titleRef={titleRef}
        />
      ) : (
        <Results results={results} answers={answers} onRestart={restart} titleRef={titleRef} />
      )}
    </div>
  );
}

function QuestionStep({ question, selected, onChoose, onBack, titleRef }: { question: Question; selected?: string; onChoose: (value: string) => void; onBack?: () => void; titleRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="animate-[fade-in_0.4s_ease]">
      <h2 ref={titleRef} tabIndex={-1} className="heading-lg outline-none">{question.title}</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {question.options.map((o) => {
          const active = selected === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChoose(o.value)}
              className={`group flex items-start gap-4 border p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-gold ${active ? "border-gold bg-gold/10" : "border-line bg-ink-2"}`}
            >
              <span className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${active ? "border-gold bg-gold text-ink" : "border-line text-transparent group-hover:border-gold"}`}>
                <Icon name="check" width={14} height={14} />
              </span>
              <span>
                <span className="block font-display text-xl tracking-wide uppercase text-bone">{o.label}</span>
                <span className="mt-1 block text-sm text-mist">{o.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
      {onBack && (
        <button type="button" onClick={onBack} className="mt-8 text-xs tracking-[0.18em] text-mist uppercase hover:text-gold">
          ← Question précédente
        </button>
      )}
    </div>
  );
}

function Cover({ f, sizes, priority }: { f: QuizFormation; sizes: string; priority?: boolean }) {
  const className = "object-cover opacity-80 transition duration-700 group-hover:scale-105";
  return f.coverUrl ? (
    <Image src={f.coverUrl} alt="" fill unoptimized className={className} />
  ) : (
    <Image src={f.cover} alt="" fill placeholder="blur" sizes={sizes} preload={priority} className={className} />
  );
}

function Results({ results, answers, onRestart, titleRef }: { results: Result[]; answers: Record<string, string>; onRestart: () => void; titleRef: React.RefObject<HTMLHeadingElement | null> }) {
  const matched = results[0]?.score > 0;
  const [best, ...others] = results;
  const summary = QUESTIONS.map((q) => q.options.find((o) => o.value === answers[q.id])?.label).filter(Boolean).join(", ");
  const whatsapp = `${site.whatsapp.href}?text=${encodeURIComponent(`Bonjour, j'ai fait le quiz « Trouver ma formation » (${summary}). ${matched ? `La formation ${best.formation.name} m'a été recommandée. ` : ""}Pouvez-vous me conseiller ?`)}`;

  return (
    <div className="animate-[fade-in_0.4s_ease]" aria-live="polite">
      <p className="eyebrow mb-3">{matched ? "Notre recommandation" : "Toutes nos formations"}</p>
      <h2 ref={titleRef} tabIndex={-1} className="heading-lg outline-none">
        {matched ? <>La formation faite pour vous : <span className={best.formation.accentText}>{best.formation.name}</span></> : "Parlons-en ensemble"}
      </h2>
      {!matched && <p className="mt-4 max-w-2xl text-mist">Vos réponses correspondent à plusieurs parcours. Découvrez nos formations ou échangez avec un conseiller pour être orienté.</p>}

      {matched && (
        <article className="group relative mt-8 grid overflow-hidden border border-gold/50 bg-ink-2 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-72 overflow-hidden">
            <Cover f={best.formation} sizes="(min-width: 1024px) 50vw, 100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-transparent to-transparent lg:bg-gradient-to-r" />
            <span className="absolute top-5 left-5 inline-flex items-center gap-2 bg-gold px-3 py-1.5 font-display text-xs tracking-[0.18em] text-ink uppercase">
              <Icon name="star" width={14} height={14} /> Meilleur choix
            </span>
          </div>
          <div className="p-8 lg:p-10">
            <span className={`mb-5 block h-1 w-14 ${best.formation.accentBg}`} />
            <h3 className="font-display text-3xl tracking-wide uppercase">{best.formation.name}</h3>
            {best.formation.details && <p className={`mt-2 text-xs tracking-[0.14em] uppercase ${best.formation.accentText}`}>{best.formation.details}</p>}
            <p className="mt-4 leading-relaxed text-mist">{best.formation.headline || best.formation.summary}</p>
            <ul className="mt-6 space-y-2">
              {best.reasons.map((r) => (
                <li key={r} className="flex items-center gap-3 text-sm text-bone">
                  <Icon name="check" width={16} height={16} className="text-gold" /> Correspond à {r}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/contact?formation=${encodeURIComponent(best.formation.slug)}`} className="btn btn-primary">
                M&apos;inscrire <Icon name="arrow" />
              </Link>
              <Link href={`/formations/${best.formation.slug}`} className="btn btn-ghost">Voir le programme</Link>
            </div>
          </div>
        </article>
      )}

      {(matched ? others : results).length > 0 && (
        <>
          <h3 className="mt-14 mb-6 font-display text-xl tracking-wide uppercase text-mist">{matched ? "Vous pourriez aussi aimer" : "Nos formations"}</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(matched ? others : results).map(({ formation: f }) => (
              <Link key={f.slug} href={`/formations/${f.slug}`} className="group relative block aspect-[4/3] overflow-hidden border border-line bg-ink">
                <Cover f={f} sizes="(min-width: 1024px) 33vw, 100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className={`mb-3 block h-1 w-10 ${f.accentBg} transition-all duration-500 group-hover:w-20`} />
                  <p className="font-display text-2xl tracking-wide uppercase text-bone">{f.name}</p>
                  {f.details && <p className={`mt-1 text-xs tracking-[0.14em] uppercase ${f.accentText}`}>{f.details}</p>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border border-line bg-ink-2 p-8">
        <p className="max-w-xl text-mist">Une question avant de vous lancer ? Un conseiller vous répond directement sur WhatsApp, avec vos réponses déjà transmises.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onRestart} className="btn btn-ghost">Recommencer</button>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary">
            <Icon name="phone" /> Parler à un conseiller
          </a>
        </div>
      </div>
    </div>
  );
}
