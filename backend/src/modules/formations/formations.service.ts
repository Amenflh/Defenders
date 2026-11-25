import { Prisma, type FormationStatus } from "../../generated/prisma/client.js";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { FORMAT_LABELS, LEVEL_LABELS } from "../planning/planning.service.js";
import type { CreateFormationInput, UpdateFormationInput } from "./formations.schemas.js";

type Module = { title: string; text: string };
type Fact = { label: string; value: string };
type Video = { url: string; title: string; layout: "portrait" | "square" | "landscape" };
type Translations = Partial<Record<"en" | "ar", Record<string, unknown>>>;

const formationSelect = {
  id: true,
  slug: true,
  name: true,
  headline: true,
  summary: true,
  durationLabel: true,
  priceTnd: true,
  status: true,
  position: true,
  level: true,
  intro: true,
  objectives: true,
  prerequisites: true,
  audience: true,
  careers: true,
  modules: true,
  facts: true,
  coverUrl: true,
  galleryUrls: true,
  accent: true,
  academy: true,
  location: true,
  practical: true,
  contactPhone: true,
  sourceUrl: true,
  coverIsPoster: true,
  videos: true,
  translations: true,
  nextSessionDate: true,
  updatedAt: true,
} satisfies Prisma.FormationSelect;

type Row = Prisma.FormationGetPayload<{ select: typeof formationSelect }>;

/** Forme renvoyée par l'API : prix en nombre, niveau avec son libellé. */
export type FormationDto = Omit<Row, "priceTnd" | "modules" | "facts" | "galleryUrls" | "nextSessionDate" | "videos" | "translations"> & {
  videos: Video[];
  translations: Translations;
  priceTnd: number | null;
  /** Date de la prochaine session au format AAAA-MM-JJ. */
  nextSessionDate: string | null;
  levelLabel: string | null;
  modules: Module[];
  facts: Fact[];
  galleryUrls: string[];
};

function toDto(row: Row): FormationDto {
  return {
    ...row,
    priceTnd: row.priceTnd === null ? null : Number(row.priceTnd),
    levelLabel: row.level ? LEVEL_LABELS[row.level] : null,
    modules: (row.modules as Module[] | null) ?? [],
    facts: (row.facts as Fact[] | null) ?? [],
    galleryUrls: (row.galleryUrls as string[] | null) ?? [],
    videos: (row.videos as Video[] | null) ?? [],
    translations: (row.translations as Translations | null) ?? {},
    nextSessionDate: row.nextSessionDate ? row.nextSessionDate.toISOString().slice(0, 10) : null,
  };
}

const slugTaken = () =>
  new ConflictError("Cet identifiant d'URL est déjà utilisé", { slug: ["Cet identifiant d'URL est déjà utilisé par une autre formation"] });

function toData(input: UpdateFormationInput): Prisma.FormationUpdateInput {
  const { priceTnd, trainerIds: _trainerIds, translations, ...rest } = input;
  return { ...rest, ...(translations ? { translations: translations as Prisma.InputJsonValue } : {}), ...(priceTnd !== undefined ? { priceTnd: priceTnd === null ? null : new Prisma.Decimal(priceTnd) } : {}) };
}

// ---------------------------------------------------------------- Public

/** Formations publiées, dans l'ordre d'affichage (#35 : lecture publique). */
export async function listPublished(): Promise<FormationDto[]> {
  const rows = await prisma.formation.findMany({
    where: { status: "published" },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: formationSelect,
  });
  return rows.map(toDto);
}

/** Détail d'une formation publiée, avec formateurs, créneaux en cours et médias (#17). */
export async function getPublishedBySlug(slug: string) {
  const row = await prisma.formation.findFirst({
    where: { slug, status: "published" },
    select: {
      ...formationSelect,
      trainers: {
        where: { trainer: { active: true } },
        orderBy: { trainer: { position: "asc" } },
        select: { trainer: { select: { id: true, name: true, title: true, bio: true, photoUrl: true, translations: true } } },
      },
      media: { orderBy: [{ position: "asc" }, { createdAt: "desc" }], select: { id: true, type: true, url: true, title: true, mimeType: true } },
    },
  });
  if (!row) throw new NotFoundError("Formation introuvable");

  const today = new Date();
  const sessions = await prisma.trainingSession.findMany({
    where: {
      formationId: row.id,
      AND: [
        { OR: [{ periodStart: null }, { periodStart: { lte: today } }] },
        { OR: [{ periodEnd: null }, { periodEnd: { gte: today } }] },
      ],
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    select: { id: true, title: true, dayOfWeek: true, startTime: true, endTime: true, format: true, level: true },
  });

  const { trainers, media, ...formation } = row;
  return {
    ...toDto(formation),
    trainers: trainers.map((t) => t.trainer),
    media,
    sessions: sessions.map((s) => ({
      id: String(s.id),
      title: s.title,
      day: s.dayOfWeek,
      start: s.startTime,
      end: s.endTime,
      format: FORMAT_LABELS[s.format],
      level: LEVEL_LABELS[s.level],
    })),
  };
}

// ---------------------------------------------------------------- Admin

/** Toutes les formations (tous statuts) avec le nombre d'inscriptions et de créneaux. */
export async function listAll(status?: FormationStatus) {
  const rows = await prisma.formation.findMany({
    where: status ? { status } : {},
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { ...formationSelect, _count: { select: { registrations: true, trainingSessions: true } } },
  });
  return rows
    .map(({ _count, ...row }) => ({ ...toDto(row), registrationCount: _count.registrations, sessionCount: _count.trainingSessions }))
    .sort((a, b) => Number(a.status === "archived") - Number(b.status === "archived")); // archivées en dernier
}

export async function getById(id: number): Promise<FormationDto & { trainerIds: number[] }> {
  const row = await prisma.formation.findUnique({ where: { id }, select: { ...formationSelect, trainers: { select: { trainerId: true } } } });
  if (!row) throw new NotFoundError("Formation introuvable");
  const { trainers, ...formation } = row;
  return { ...toDto(formation), trainerIds: trainers.map((t) => t.trainerId) };
}

/** Remplace les formateurs d'une formation (identifiants inconnus ignorés). */
async function setTrainers(formationId: number, trainerIds: number[] | undefined) {
  if (!trainerIds) return;
  const known = await prisma.trainer.findMany({ where: { id: { in: trainerIds } }, select: { id: true } });
  await prisma.$transaction([
    prisma.formationTrainer.deleteMany({ where: { formationId } }),
    prisma.formationTrainer.createMany({ data: known.map(({ id }) => ({ formationId, trainerId: id })) }),
  ]);
}

export async function create(input: CreateFormationInput): Promise<FormationDto> {
  // Sans ordre précisé, la nouvelle formation s'affiche après les autres.
  const position = input.position ?? ((await prisma.formation.aggregate({ _max: { position: true } }))._max.position ?? 0) + 1;
  try {
    const row = await prisma.formation.create({ data: toData({ ...input, position }) as Prisma.FormationCreateInput, select: formationSelect });
    await setTrainers(row.id, input.trainerIds);
    return toDto(row);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") throw slugTaken();
    throw err;
  }
}

export async function update(id: number, input: UpdateFormationInput): Promise<FormationDto> {
  await getById(id);
  try {
    const row = await prisma.formation.update({ where: { id }, data: toData(input), select: formationSelect });
    await setTrainers(id, input.trainerIds);
    return toDto(row);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") throw slugTaken();
    throw err;
  }
}

/**
 * Suppression définitive, seulement si aucune demande d'inscription n'y fait référence.
 * Sinon, la formation doit être archivée : l'historique des inscriptions est conservé.
 */
export async function remove(id: number): Promise<void> {
  const formation = await prisma.formation.findUnique({ where: { id }, select: { _count: { select: { registrations: true } } } });
  if (!formation) throw new NotFoundError("Formation introuvable");
  if (formation._count.registrations > 0) {
    throw new ConflictError(
      `Impossible de supprimer : ${formation._count.registrations} demande(s) d'inscription concernent cette formation. Archivez-la plutôt.`,
    );
  }
  await prisma.formation.delete({ where: { id } });
}
