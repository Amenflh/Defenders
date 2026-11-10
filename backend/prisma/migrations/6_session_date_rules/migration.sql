-- Planning : une seule date par formation. Inscriptions : confirmation de lecture du règlement intérieur.

-- AlterTable
ALTER TABLE "formations" ADD COLUMN "next_session_date" DATE;

-- AlterTable
ALTER TABLE "registrations" ADD COLUMN "rules_accepted_at" TIMESTAMPTZ(6);
