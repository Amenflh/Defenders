import type { MediaType, Prisma } from "../../generated/prisma/client.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { deleteStoredFile, storeFile, type UploadKind } from "./media.files.js";
import type { LinkMediaInput, ListQuery, UpdateMediaInput, UploadFields } from "./media.schemas.js";

const select = {
  id: true,
  type: true,
  url: true,
  title: true,
  category: true,
  mimeType: true,
  sizeBytes: true,
  createdAt: true,
  formation: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.MediaSelect;

async function assertFormation(formationId: number | null | undefined) {
  if (formationId == null) return;
  if (!(await prisma.formation.count({ where: { id: formationId } }))) {
    throw new ValidationError({ formationId: ["Formation inconnue"] });
  }
}

/** Range le fichier vérifié et l'enregistre en base, associé à une formation et/ou une catégorie de galerie. */
export async function upload(kind: UploadKind, file: Express.Multer.File, fields: UploadFields) {
  await assertFormation(fields.formationId);
  const stored = await storeFile(kind, file);
  try {
    return await prisma.media.create({
      data: {
        type: kind as MediaType,
        ...stored,
        title: fields.title || file.originalname.slice(0, 120),
        category: fields.category,
        formationId: fields.formationId,
      },
      select,
    });
  } catch (err) {
    await deleteStoredFile(stored.storageKey);
    throw err;
  }
}

/** Enregistre un média déjà hébergé (aucun fichier stocké : sa suppression ne touche pas au disque). */
export async function link(input: LinkMediaInput) {
  await assertFormation(input.formationId);
  return prisma.media.create({ data: { ...input, type: input.type as MediaType }, select });
}

/** Liste des médias, filtrable par type, catégorie et formation (galerie publique #18 ou admin). */
export function list(query: ListQuery, { publicOnly }: { publicOnly: boolean }) {
  return prisma.media.findMany({
    where: {
      ...(query.type ? { type: query.type } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.formation ? { formation: { slug: query.formation } } : {}),
      // Côté public : pas de média rattaché à une formation brouillon ou archivée.
      ...(publicOnly ? { OR: [{ formationId: null }, { formation: { status: "published" as const } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 500,
    select,
  });
}

export async function update(id: number, input: UpdateMediaInput) {
  if (!(await prisma.media.count({ where: { id } }))) throw new NotFoundError("Média introuvable");
  await assertFormation(input.formationId);
  return prisma.media.update({ where: { id }, data: input, select });
}

/** Supprime le média et son fichier. Une formation qui l'utilisait comme visuel reprend le visuel par défaut. */
export async function remove(id: number) {
  const media = await prisma.media.findUnique({ where: { id }, select: { url: true, storageKey: true } });
  if (!media) throw new NotFoundError("Média introuvable");
  await prisma.$transaction([
    prisma.formation.updateMany({ where: { coverUrl: media.url }, data: { coverUrl: null } }),
    prisma.media.delete({ where: { id } }),
  ]);
  if (media.storageKey) await deleteStoredFile(media.storageKey);
}
