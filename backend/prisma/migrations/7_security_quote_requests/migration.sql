CREATE TYPE "SecurityQuoteStatus" AS ENUM ('nouveau', 'contacte', 'devis_envoye', 'gagne', 'perdu', 'archive');

CREATE TABLE "security_quote_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "company_name" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL DEFAULT '',
  "service" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "consent_at" TIMESTAMPTZ(6) NOT NULL,
  "status" "SecurityQuoteStatus" NOT NULL DEFAULT 'nouveau',
  CONSTRAINT "security_quote_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "security_quote_requests_created_at_idx" ON "security_quote_requests"("created_at" DESC);
CREATE INDEX "security_quote_requests_status_created_at_idx" ON "security_quote_requests"("status", "created_at" DESC);
