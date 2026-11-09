import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { config } from "../../config.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { detectFormat, readHead } from "../media/media.files.js";

/** Dossier privé des supports : jamais servi en statique, lu seulement par fileFor() après contrôle d'accès. */
export const resourcesDir = join(config.uploads.privateDir, "resources");
export const resourcesTmpDir = join(config.uploads.privateDir, ".tmp");
for (const dir of [resourcesDir, resourcesTmpDir]) mkdirSync(dir, { recursive: true });

/** Format d'un support d'après son contenu : PDF, image (JPG/PNG/WebP) ou vidéo (MP4/WebM). */
function detectResource(head: Buffer) {
  if (head.toString("latin1", 0, 5) === "%PDF-") return { mime: "application/pdf", ext: "pdf" };
  const media = detectFormat(head);
  return media ? { mime: media.mime, ext: media.ext } : null;
}

const select = {
  id: true, title: true, description: true, kind: true, formationId: true, originalName: true,
  mime: true, size: true, url: true, position: true, active: true, createdAt: true,
  formation: { select: { id: true, name: true, slug: true } },
} as const;

export type ResourceInput = { title: string; description: string; formationId: number | null; url?: string };

export function listForAdmin() {
  return prisma.resource.findMany({ orderBy: [{ formationId: "asc" }, { position: "asc" }, { id: "asc" }], select });
}

/** Crée un support : fichier déposé (vérifié par sa signature) ou lien externe. */
export async function create(input: ResourceInput, file?: Express.Multer.File) {
  if (input.formationId !== null && !(await prisma.formation.count({ where: { id: input.formationId } }))) {
    throw new ValidationError({ formationId: ["Formation inconnue"] });
  }
  if (!file) {
    if (!input.url) throw new ValidationError({ file: ["Ajoutez un fichier ou un lien"] });
    return prisma.resource.create({ data: { title: input.title, description: input.description, formationId: input.formationId, kind: "link", url: input.url }, select });
  }

  const format = detectResource(await readHead(file.path));
  if (!format) {
    await rm(file.path, { force: true });
    throw new ValidationError({ file: ["Format non accepté : PDF, JPG, PNG, WebP, MP4 ou WebM"] });
  }
  const storedName = `${randomUUID()}.${format.ext}`;
  await rename(file.path, join(resourcesDir, storedName));
  return prisma.resource.create({
    data: {
      title: input.title, description: input.description, formationId: input.formationId, kind: "file",
      storedName, originalName: file.originalname.slice(0, 200), mime: format.mime, size: file.size,
    },
    select,
  });
}

export async function update(id: number, data: Partial<{ title: string; description: string; formationId: number | null; active: boolean; position: number }>) {
  if (!(await prisma.resource.count({ where: { id } }))) throw new NotFoundError("Ressource introuvable");
  return prisma.resource.update({ where: { id }, data, select });
}

export async function remove(id: number) {
  const resource = await prisma.resource.findUnique({ where: { id }, select: { storedName: true } });
  if (!resource) throw new NotFoundError("Ressource introuvable");
  await prisma.resource.delete({ where: { id } });
  if (resource.storedName && /^[\w-]+\.\w+$/.test(resource.storedName)) await rm(join(resourcesDir, resource.storedName), { force: true });
}

// ---------------------------------------------------------------- Côté stagiaire

/**
 * Formations auxquelles le client est inscrit (demande au statut « inscrit »).
 * Accès : support d'une de ces formations, ou support général (sans formation) dès la première inscription.
 */
async function enrolledFormationIds(userId: number): Promise<Set<number>> {
  const rows = await prisma.registrationFormation.findMany({
    where: { registration: { userId, status: "inscrit" } },
    select: { formationId: true },
  });
  return new Set(rows.map((r) => r.formationId));
}

const canAccess = (enrolled: Set<number>, formationId: number | null) => (formationId === null ? enrolled.size > 0 : enrolled.has(formationId));

/**
 * Supports actifs : ouverts si le client y a droit, sinon « verrouillés » (titre visible, contenu caché)
 * pour montrer ce que l'inscription débloque.
 */
export async function listForClient(userId: number) {
  const [enrolled, resources] = await Promise.all([
    enrolledFormationIds(userId),
    prisma.resource.findMany({ where: { active: true }, orderBy: [{ formationId: "asc" }, { position: "asc" }, { id: "asc" }], select }),
  ]);
  return {
    enrolled: enrolled.size > 0,
    resources: resources.map(({ active: _a, position: _p, originalName, url, ...r }) => {
      const locked = !canAccess(enrolled, r.formationId);
      return { ...r, locked, url: locked ? null : url, originalName: locked ? null : originalName };
    }),
  };
}

/** Fichier d'un support, après contrôle d'accès (403 si non inscrit à la formation). */
export async function fileFor(userId: number, id: number) {
  const resource = await prisma.resource.findFirst({ where: { id, active: true, kind: "file" }, select: { formationId: true, storedName: true, originalName: true, mime: true } });
  if (!resource?.storedName) throw new NotFoundError("Ressource introuvable");
  if (!canAccess(await enrolledFormationIds(userId), resource.formationId)) {
    throw new ForbiddenError("Ce support est réservé aux stagiaires inscrits à cette formation.");
  }
  return { path: join(resourcesDir, resource.storedName), name: resource.originalName ?? resource.storedName, mime: resource.mime ?? "application/octet-stream" };
}
