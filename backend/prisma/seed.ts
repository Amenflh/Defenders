/**
 * Seed Prisma : `npx prisma db seed` (lancé aussi par `prisma migrate reset`).
 * La même logique s'exécute au démarrage du serveur, elle est idempotente.
 */
import { ensureSeedData } from "../src/db/seed.js";
import { prisma } from "../src/lib/prisma.js";

try {
  await ensureSeedData();
  console.log("✅ Seed terminé");
} finally {
  await prisma.$disconnect();
}
