import type { SessionFormat, SessionLevel } from "../../generated/prisma/client.js";
import { BadRequestError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

const FORMAT_LABELS: Record<SessionFormat, string> = {
  theorie: "Théorie",
  pratique: "Pratique",
  atelier: "Atelier",
  evaluation: "Évaluation",
};

const LEVEL_LABELS: Record<SessionLevel, string> = {
  tous_niveaux: "Tous niveaux",
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export type PlanningSession = {
  id: string;
  discipline: string;
  title: string;
  day: number;
  start: string;
  end: string;
  format: string;
  level: string;
};

/**
 * Planning hebdomadaire des formations publiées.
 * Ne retourne que les créneaux dont la période (si définie) inclut la date du jour.
 */
export async function getPlanning(discipline?: string): Promise<PlanningSession[]> {
  if (discipline) {
    const exists = await prisma.formation.count({ where: { slug: discipline, status: "published" } });
    if (!exists) throw new BadRequestError(`Formation inconnue : ${discipline}`);
  }

  const today = new Date();
  const sessions = await prisma.trainingSession.findMany({
    where: {
      formation: { status: "published", ...(discipline ? { slug: discipline } : {}) },
      AND: [
        { OR: [{ periodStart: null }, { periodStart: { lte: today } }] },
        { OR: [{ periodEnd: null }, { periodEnd: { gte: today } }] },
      ],
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    select: {
      id: true,
      title: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      format: true,
      level: true,
      formation: { select: { slug: true } },
    },
  });

  return sessions.map((s) => ({
    id: String(s.id),
    discipline: s.formation.slug,
    title: s.title,
    day: s.dayOfWeek,
    start: s.startTime,
    end: s.endTime,
    format: FORMAT_LABELS[s.format],
    level: LEVEL_LABELS[s.level],
  }));
}
