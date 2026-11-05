import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { seedAdmin } from "../modules/auth/auth.service.js";
import { FORMATION_CONTENT } from "./formation-content.js";

type SampleSession = Omit<Prisma.TrainingSessionCreateManyInput, "formationId"> & { formation: string };

/**
 * Planning hebdomadaire d'EXEMPLE, inséré seulement si la table est vide.
 * À remplacer par le planning réel (directement en base, ou via la future interface admin).
 */
const SAMPLE_PLANNING: SampleSession[] = [
  { formation: "pilates", title: "Fondamentaux du Pilates Mat", dayOfWeek: 1, startTime: "09:00", endTime: "11:00", format: "pratique", level: "debutant" },
  { formation: "pilates", title: "Anatomie & biomécanique", dayOfWeek: 2, startTime: "14:00", endTime: "16:00", format: "theorie", level: "tous_niveaux" },
  { formation: "pilates", title: "Reformer : progressions", dayOfWeek: 4, startTime: "09:00", endTime: "11:30", format: "pratique", level: "intermediaire" },
  { formation: "pilates", title: "Construire une séance", dayOfWeek: 6, startTime: "10:00", endTime: "12:00", format: "atelier", level: "avance" },

  { formation: "football", title: "Méthodologie de l'entraînement", dayOfWeek: 1, startTime: "14:00", endTime: "16:00", format: "theorie", level: "tous_niveaux" },
  { formation: "football", title: "Séances terrain : jeu réduit", dayOfWeek: 3, startTime: "16:00", endTime: "18:30", format: "pratique", level: "intermediaire" },
  { formation: "football", title: "Préparation physique du footballeur", dayOfWeek: 5, startTime: "09:00", endTime: "11:00", format: "theorie", level: "tous_niveaux" },
  { formation: "football", title: "Analyse vidéo & tactique", dayOfWeek: 6, startTime: "14:00", endTime: "16:00", format: "atelier", level: "avance" },

  { formation: "personal-training", title: "Physiologie de l'effort", dayOfWeek: 2, startTime: "09:00", endTime: "11:00", format: "theorie", level: "tous_niveaux" },
  { formation: "personal-training", title: "Musculation : technique & sécurité", dayOfWeek: 3, startTime: "09:00", endTime: "11:30", format: "pratique", level: "debutant" },
  { formation: "personal-training", title: "Nutrition & composition corporelle", dayOfWeek: 4, startTime: "14:00", endTime: "16:00", format: "theorie", level: "intermediaire" },
  { formation: "personal-training", title: "Coaching client & programmation", dayOfWeek: 5, startTime: "14:00", endTime: "16:30", format: "atelier", level: "avance" },
  { formation: "personal-training", title: "Évaluation pratique", dayOfWeek: 7, startTime: "10:00", endTime: "12:00", format: "evaluation", level: "tous_niveaux" },
];

/** Données de référence, idempotent : peut être lancé à chaque démarrage. */
export async function ensureSeedData(): Promise<void> {
  await seedAdmin();
  await seedFormationContent();

  if ((await prisma.trainingSession.count()) > 0) return;
  const formations = await prisma.formation.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(formations.map((f) => [f.slug, f.id]));

  const data = SAMPLE_PLANNING.filter((s) => idBySlug.has(s.formation)).map(({ formation, ...s }) => ({
    ...s,
    formationId: idBySlug.get(formation)!,
  }));
  const { count } = await prisma.trainingSession.createMany({ data });
  console.info(`[seed] planning d'exemple inséré (${count} créneaux)`);
}

/** Contenu initial des formations d'origine, seulement si elles n'en ont pas encore (jamais d'écrasement). */
async function seedFormationContent(): Promise<void> {
  const empty = await prisma.formation.findMany({
    where: { slug: { in: Object.keys(FORMATION_CONTENT) }, intro: { isEmpty: true }, objectives: { isEmpty: true } },
    select: { id: true, slug: true, durationLabel: true },
  });
  for (const f of empty) {
    const { durationLabel, ...content } = FORMATION_CONTENT[f.slug];
    await prisma.formation.update({ where: { id: f.id }, data: { ...content, durationLabel: f.durationLabel ?? durationLabel ?? null } });
  }
  if (empty.length) console.info(`[seed] contenu des formations initialisé (${empty.map((f) => f.slug).join(", ")})`);
}
