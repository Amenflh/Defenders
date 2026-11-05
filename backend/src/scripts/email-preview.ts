/**
 * Aperçu des e-mails d'inscription.
 *   npm run email:preview                    → écrit les HTML dans tmp/email-preview/
 *   npm run email:preview -- vous@exemple.tn → les envoie aussi à cette adresse (test SMTP)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isEmailConfigured, logoAttachment, sendMail } from "../lib/email.js";
import { renderAdminEmail, renderConfirmationEmail, type RegistrationEmailData } from "../modules/registrations/registrations.emails.js";

const sample: RegistrationEmailData = {
  registration: {
    id: "3f2a9c1e-7b4d-4e2a-9f1c-2d8e6a5b4c3d",
    createdAt: new Date(),
    firstName: "Sami",
    lastName: "Ben Ali",
    email: "sami.benali@example.com",
    phone: "+216 22 123 456",
    city: "Nabeul",
    profile: "jeune-diplome",
    trainings: ["pilates", "personal-training"],
    availability: "intensif",
    message: "Bonjour,\nje viens d'obtenir ma licence STAPS et je souhaite me spécialiser.\nQuelles sont les prochaines dates ?",
    status: "nouveau",
  },
  formationNames: ["Pilates", "Personal Training"],
  attachment: { filename: "CV-Sami-Ben-Ali.pdf", size: 248_000 },
};

const emails = { "equipe.html": renderAdminEmail(sample), "candidat.html": renderConfirmationEmail(sample) };
const dir = join(process.cwd(), "tmp", "email-preview");
mkdirSync(dir, { recursive: true });

// Dans un navigateur, l'image « cid: » n'existe pas : on l'intègre en data URI pour l'aperçu.
const [logo] = logoAttachment();
const dataUri = logo ? `data:image/jpeg;base64,${(logo.content as Buffer).toString("base64")}` : "";
for (const [file, email] of Object.entries(emails)) {
  writeFileSync(join(dir, file), email.html.replaceAll("cid:defenders-logo", dataUri));
  console.info(`✓ ${join(dir, file)}  —  objet : ${email.subject}`);
}

const to = process.argv[2];
if (to) {
  if (!isEmailConfigured()) {
    console.error("SMTP non configuré : définissez SMTP_USER et SMTP_PASS dans backend/.env");
    process.exit(1);
  }
  for (const email of Object.values(emails)) await sendMail({ to, ...email, attachments: logoAttachment() });
  console.info(`✓ 2 e-mails de test envoyés à ${to}`);
}
