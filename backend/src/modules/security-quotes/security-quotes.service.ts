import type { SecurityQuoteStatus } from "../../generated/prisma/client.js";
import { NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateSecurityQuoteInput } from "./security-quotes.schemas.js";

export type SecurityQuoteDto = {
  id: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  city: string;
  service: string;
  message: string;
  consentAt: Date;
  status: SecurityQuoteStatus;
};

export async function createSecurityQuote(input: CreateSecurityQuoteInput): Promise<SecurityQuoteDto> {
  const { consent: _consent, website: _website, ...data } = input;
  return prisma.securityQuoteRequest.create({
    data: { ...data, consentAt: new Date() },
  });
}

export async function listSecurityQuotes(status?: SecurityQuoteStatus): Promise<SecurityQuoteDto[]> {
  return prisma.securityQuoteRequest.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}

export async function updateSecurityQuoteStatus(id: string, status: SecurityQuoteStatus): Promise<SecurityQuoteDto> {
  const exists = await prisma.securityQuoteRequest.count({ where: { id } });
  if (!exists) throw new NotFoundError("Demande de devis introuvable");
  return prisma.securityQuoteRequest.update({ where: { id }, data: { status } });
}
