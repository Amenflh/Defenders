import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { FAQ_TRANSLATIONS, FITNESS_EXTRAS, HISTORY, MEDIA, TRAINERS, TSA_FORMATIONS } from "./initial-content.js";

/**
 * Données de départ insérées UNE SEULE FOIS : ce que l'admin supprime ensuite ne revient jamais au redémarrage.
 * Les étapes déjà faites sont notées dans site_settings (clé « seed »).
 */
export type SeedStep = "base" | "dynamicContent";
const KEY = "seed";

async function readFlags(db: Prisma.TransactionClient | typeof prisma = prisma): Promise<Partial<Record<SeedStep, boolean>>> {
  const row = await db.siteSetting.findUnique({ where: { key: KEY } });
  try {
    return row ? (JSON.parse(row.value) as Partial<Record<SeedStep, boolean>>) : {};
  } catch {
    return {};
  }
}

export async function seedStepDone(step: SeedStep): Promise<boolean> {
  return (await readFlags())[step] === true;
}

export async function markSeedStep(step: SeedStep, db: Prisma.TransactionClient | typeof prisma = prisma): Promise<void> {
  const value = JSON.stringify({ ...(await readFlags(db)), [step]: true });
  await db.siteSetting.upsert({ where: { key: KEY }, create: { key: KEY, value }, update: { value } });
}

const isEmptyObject = (v: unknown) => !v || (typeof v === "object" && Object.keys(v).length === 0);

/** Photos déjà affichées sur les pages Fitness : elles deviennent la galerie (modifiable) de chaque formation. */
const FITNESS_GALLERIES: Record<string, string[]> = {
  "pilates": [
    "/pics/Pilates_images/acc_images.jpg",
    "/pics/Pilates_images/acc_images2.jpg",
    "/pics/Pilates_images/pilates-unsplash-3.jpg",
    "/pics/Pilates_images/pilates-unsplash-4.jpg",
    "/pics/Pilates_images/pilates-unsplash-5.jpg",
    "/pics/Pilates_images/pilates-studio.jpg"
  ],
  "football": [
    "/pics/football_images/staff-technique.jpg",
    "/pics/football_images/exercice-plots.jpg",
    "/pics/football_images/coach-terrain.jpg",
    "/pics/football_images/2.jpeg"
  ],
  "personal-training": [
    "/pics/personal_trainers/coaching-halterophilie.jpg",
    "/pics/personal_trainers/suivi-client.jpg",
    "/pics/personal_trainers/coaching-equilibre.jpg"
  ]
};

/** Contenus auparavant écrits dans le code du site : formations TSA, équipe, historique, galeries, vidéos, traductions. */
export async function seedDynamicContent(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Plusieurs instances peuvent démarrer ensemble : une seule insère.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(340024)`;
    if ((await readFlags(tx)).dynamicContent) return;

    // Formations Fitness : seulement les champs encore vides.
    for (const [slug, extra] of Object.entries(FITNESS_EXTRAS)) {
      const f = await tx.formation.findUnique({ where: { slug } });
      if (!f) continue;
      await tx.formation.update({
        where: { id: f.id },
        data: {
          ...(f.location ? {} : { location: extra.location }),
          ...(f.practical ? {} : { practical: extra.practical }),
          ...(Array.isArray(f.videos) && f.videos.length ? {} : { videos: extra.videos as Prisma.InputJsonValue }),
          galleryUrls: [...new Set([...((f.galleryUrls as string[] | null) ?? []), ...(FITNESS_GALLERIES[slug] ?? [])])].filter((url) => url !== f.coverUrl),
          ...(isEmptyObject(f.translations) ? { translations: extra.translations as Prisma.InputJsonValue } : {}),
        },
      });
    }

    for (const formation of TSA_FORMATIONS) {
      const slug = String(formation.slug);
      if (await tx.formation.count({ where: { slug } })) continue;
      await tx.formation.create({ data: formation as unknown as Prisma.FormationCreateInput });
    }

    for (const { formations, translations, ...trainer } of TRAINERS) {
      if (await tx.trainer.count({ where: { name: trainer.name } })) continue;
      const linked = await tx.formation.findMany({ where: { slug: { in: formations } }, select: { id: true } });
      await tx.trainer.create({
        data: { ...trainer, translations: translations as Prisma.InputJsonValue, formations: { create: linked.map(({ id }) => ({ formationId: id })) } },
      });
    }

    if ((await tx.historyEntry.count()) === 0) {
      await tx.historyEntry.createMany({
        data: HISTORY.map((e) => ({ ...e, date: e.date ? new Date(`${String(e.date)}T00:00:00Z`) : null })) as Prisma.HistoryEntryCreateManyInput[],
      });
    }

    // Vidéos de fond existantes : celles de la Fitness Academy.
    await tx.media.updateMany({ where: { category: "accueil", academy: null }, data: { academy: "fitness" } });
    const known = new Set((await tx.media.findMany({ select: { url: true, category: true, academy: true } })).map((m) => `${m.url}|${m.category}|${m.academy}`));
    const missing = MEDIA.filter((m) => !known.has(`${m.url}|${m.category}|${m.academy}`));
    if (missing.length) await tx.media.createMany({ data: missing });

    for (const item of await tx.cmsItem.findMany({ where: { section: "faq" } })) {
      const translations = FAQ_TRANSLATIONS[item.title];
      if (translations && isEmptyObject(item.translations)) {
        await tx.cmsItem.update({ where: { id: item.id }, data: { translations: translations as Prisma.InputJsonValue } });
      }
    }

    // Promotions d'origine : le site les cachait alors que l'admin les disait « publiées ».
    await tx.cmsItem.updateMany({
      where: {
        section: "promotions",
        imageUrl: { in: ["/pics/football_images/acc_images.jpg", "/pics/Pilates_images/acc_images.jpg", "/pics/personal_trainers/acc_images.jpg"] },
      },
      data: { active: false },
    });

    await markSeedStep("dynamicContent", tx);
    console.info("[seed] contenus des académies insérés (formations TSA, équipe, historique, galeries)");
  }, { timeout: 60_000, maxWait: 20_000 });
}
