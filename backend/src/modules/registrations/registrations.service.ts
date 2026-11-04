import type { Prisma, RegistrationStatus } from "../../generated/prisma/client.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateRegistrationInput } from "./registrations.schemas.js";

/** Forme renvoyée par l'API (inchangée pour le frontend). */
export type RegistrationDto = {
  id: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  profile: string;
  trainings: string[];
  availability: string;
  message: string;
  status: RegistrationStatus;
};

const include = { formations: { select: { formation: { select: { slug: true, position: true } } } } } satisfies Prisma.RegistrationInclude;
type Row = Prisma.RegistrationGetPayload<{ include: typeof include }>;

function toDto({ formations, userId: _userId, ...r }: Row): RegistrationDto {
  const trainings = formations.map((f) => f.formation).sort((a, b) => a.position - b.position).map((f) => f.slug);
  return { ...r, trainings };
}

/** Enregistre une demande ; userId la rattache au compte client connecté. */
export async function createRegistration(input: CreateRegistrationInput, userId?: number): Promise<RegistrationDto> {
  const formations = await prisma.formation.findMany({
    where: { slug: { in: input.trainings }, status: "published" },
    select: { id: true, slug: true },
  });
  if (formations.length !== input.trainings.length) {
    throw new ValidationError({ trainings: ["Formation inconnue ou indisponible"] });
  }

  const { trainings: _slugs, consent: _consent, ...data } = input;
  const row = await prisma.registration.create({
    data: { ...data, userId, formations: { create: formations.map((f) => ({ formationId: f.id })) } },
    include,
  });
  return toDto(row);
}

/** Liste admin : demandes (filtrables par statut) + compteurs par statut. */
export async function listRegistrations(status?: RegistrationStatus) {
  const [rows, groups] = await Promise.all([
    prisma.registration.findMany({ where: status ? { status } : {}, orderBy: { createdAt: "desc" }, take: 500, include }),
    prisma.registration.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  return {
    contacts: rows.map(toDto),
    counts: Object.fromEntries(groups.map((g) => [g.status, g._count._all])) as Record<string, number>,
  };
}

export async function listRegistrationsForUser(userId: number): Promise<RegistrationDto[]> {
  const rows = await prisma.registration.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include });
  return rows.map(toDto);
}

export async function updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<RegistrationDto> {
  const exists = await prisma.registration.count({ where: { id } });
  if (!exists) throw new NotFoundError("Demande introuvable");
  return toDto(await prisma.registration.update({ where: { id }, data: { status }, include }));
}
