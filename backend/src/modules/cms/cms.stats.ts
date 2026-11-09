import { prisma } from "../../lib/prisma.js";

const DAY = 86_400_000;
/** Une demande « nouveau » non traitée après ce délai est signalée comme relance. */
const FOLLOW_UP_AFTER_HOURS = 48;
const tunisDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis", year: "numeric", month: "2-digit", day: "2-digit" });

const isInquiry = (profile: string) => profile === "demande-info";

function countBy<T>(rows: T[], key: (row: T) => string, limit?: number) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const k = key(row).trim();
    if (k) map.set(k, (map.get(k) ?? 0) + 1);
  }
  const list = [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  return limit ? list.slice(0, limit) : list;
}

/** Variation en % par rapport à la période précédente (null si rien à comparer). */
function trend(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Statistiques du tableau de bord sur les `days` derniers jours, comparées aux `days` jours précédents.
 * Le volume d'une académie reste modeste : agrégation en mémoire, une seule lecture par table.
 */
export async function getAdminStats(days: number) {
  const now = Date.now();
  const since = new Date(now - days * DAY);
  const previousSince = new Date(now - 2 * days * DAY);
  const followUpBefore = new Date(now - FOLLOW_UP_AFTER_HOURS * 3_600_000);

  const [rows, newClients, previousClients, followUps, followUpCount, formations] = await Promise.all([
    prisma.registration.findMany({
      where: { createdAt: { gte: previousSince } },
      select: {
        createdAt: true,
        profile: true,
        status: true,
        city: true,
        availability: true,
        formations: { select: { formationId: true } },
      },
      take: 20_000,
    }),
    prisma.user.count({ where: { role: "client", createdAt: { gte: since } } }),
    prisma.user.count({ where: { role: "client", createdAt: { gte: previousSince, lt: since } } }),
    prisma.registration.findMany({
      where: { status: "nouveau", createdAt: { lt: followUpBefore } },
      orderBy: { createdAt: "asc" },
      take: 8,
      select: {
        id: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        profile: true,
        formations: { select: { formation: { select: { name: true } } } },
      },
    }),
    prisma.registration.count({ where: { status: "nouveau", createdAt: { lt: followUpBefore } } }),
    prisma.formation.findMany({ select: { id: true, name: true, slug: true, accent: true } }),
  ]);

  const current = rows.filter((r) => r.createdAt >= since);
  const previous = rows.filter((r) => r.createdAt < since);
  const registrations = current.filter((r) => !isInquiry(r.profile));
  const inquiries = current.filter((r) => isInquiry(r.profile));
  const previousRegistrations = previous.filter((r) => !isInquiry(r.profile));
  const enrolled = current.filter((r) => r.status === "inscrit").length;
  const previousEnrolled = previous.filter((r) => r.status === "inscrit").length;
  const processed = current.filter((r) => r.status !== "nouveau").length;

  // Série quotidienne (jours sans demande inclus, pour un graphique continu).
  const series = new Map<string, { date: string; registrations: number; inquiries: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const date = tunisDay.format(new Date(now - i * DAY));
    series.set(date, { date, registrations: 0, inquiries: 0 });
  }
  for (const r of current) {
    const point = series.get(tunisDay.format(r.createdAt));
    if (point) point[isInquiry(r.profile) ? "inquiries" : "registrations"] += 1;
  }

  const formationById = new Map(formations.map((f) => [f.id, f]));
  const formationCounts = new Map<number, number>();
  for (const r of registrations) for (const f of r.formations) formationCounts.set(f.formationId, (formationCounts.get(f.formationId) ?? 0) + 1);
  const topFormations = [...formationCounts.entries()]
    .map(([id, count]) => ({ id, name: formationById.get(id)?.name ?? `#${id}`, slug: formationById.get(id)?.slug ?? "", accent: formationById.get(id)?.accent ?? "gold", count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const funnel = (["nouveau", "contacte", "inscrit", "archive"] as const).map((status) => ({
    status,
    count: current.filter((r) => r.status === status).length,
  }));

  return {
    days,
    generatedAt: new Date(now).toISOString(),
    kpis: {
      total: { value: current.length, trend: trend(current.length, previous.length) },
      registrations: { value: registrations.length, trend: trend(registrations.length, previousRegistrations.length) },
      inquiries: { value: inquiries.length, trend: trend(inquiries.length, previous.length - previousRegistrations.length) },
      enrolled: { value: enrolled, trend: trend(enrolled, previousEnrolled) },
      conversionRate: current.length ? Math.round((enrolled / current.length) * 100) : 0,
      processingRate: current.length ? Math.round((processed / current.length) * 100) : 0,
      newClients: { value: newClients, trend: trend(newClients, previousClients) },
    },
    series: [...series.values()],
    funnel,
    topFormations,
    profiles: countBy(registrations, (r) => r.profile),
    availabilities: countBy(registrations, (r) => r.availability),
    cities: countBy(current, (r) => r.city.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()), 6),
    followUps: {
      afterHours: FOLLOW_UP_AFTER_HOURS,
      total: followUpCount,
      items: followUps.map(({ formations: links, ...r }) => ({ ...r, formations: links.map((l) => l.formation.name) })),
    },
  };
}
