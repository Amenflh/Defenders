/**
 * Crée un admin (ou réinitialise son mot de passe / le promeut admin s'il existe déjà).
 * Usage : npm run admin:create -- <email> <motdepasse> [nom]
 */
import { prisma } from "../lib/prisma.js";
import { upsertAdmin } from "../modules/auth/auth.service.js";

const [email, password, ...nameParts] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage : npm run admin:create -- <email> <motdepasse> [nom]");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Le mot de passe doit contenir au moins 10 caractères.");
  process.exit(1);
}

try {
  const admin = await upsertAdmin(email, password, nameParts.join(" ") || "Administrateur");
  console.log(`✅ Admin prêt : ${admin.email} (id ${admin.id})`);
} finally {
  await prisma.$disconnect();
}
