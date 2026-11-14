import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prisma, useApi } from "./helpers.js";

const { api, adminToken, clientToken } = useApi();

const validQuote = (overrides: Record<string, unknown> = {}) => ({
  firstName: "Sami",
  lastName: "Ben Ali",
  companyName: "Entreprise test",
  email: "sami@test.local",
  phone: "+216 22 333 444",
  city: "Hammamet",
  service: "gardiennage",
  message: "Nous souhaitons un devis pour un site professionnel.",
  consent: true,
  website: "",
  ...overrides,
});

describe("demandes de devis DSP", () => {
  it("enregistre une demande et la rend disponible dans l'espace admin", async () => {
    const created = await api("/api/security-quotes", { method: "POST", body: validQuote() });
    assert.equal(created.status, 201);

    const saved = await prisma.securityQuoteRequest.findUniqueOrThrow({ where: { id: created.body.id } });
    assert.equal(saved.companyName, "Entreprise test");
    assert.equal(saved.status, "nouveau");
    assert.ok(saved.consentAt instanceof Date);

    const token = await adminToken();
    const list = await api("/api/admin/security-quotes", { token });
    assert.equal(list.status, 200);
    assert.ok(list.body.quotes.some((quote: { id: string }) => quote.id === created.body.id));
  });

  it("refuse les champs invalides et le consentement absent", async () => {
    for (const overrides of [
      { consent: false },
      { service: "service-inconnu" },
      { email: "pas-un-email" },
      { message: "court" },
    ]) {
      const response = await api("/api/security-quotes", { method: "POST", body: validQuote(overrides) });
      assert.equal(response.status, 422, JSON.stringify(overrides));
    }
  });

  it("le champ piège n'enregistre rien et n'est pas une réponse de succès", async () => {
    const before = await prisma.securityQuoteRequest.count();
    const response = await api("/api/security-quotes", {
      method: "POST",
      body: validQuote({ website: "https://spam.example" }),
    });
    assert.equal(response.status, 202);
    assert.equal(response.body.ok, false);
    assert.equal(await prisma.securityQuoteRequest.count(), before);
  });

  it("réserve la liste et les changements de statut aux administrateurs", async () => {
    const created = await api("/api/security-quotes", { method: "POST", body: validQuote() });
    assert.equal((await api("/api/admin/security-quotes")).status, 401);
    const client = await clientToken();
    assert.equal((await api("/api/admin/security-quotes", { token: client })).status, 403);

    const admin = await adminToken();
    const updated = await api(`/api/admin/security-quotes/${created.body.id}`, {
      method: "PATCH",
      token: admin,
      body: { status: "devis_envoye" },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.quote.status, "devis_envoye");
    assert.equal(
      (await api(`/api/admin/security-quotes/${created.body.id}`, { method: "PATCH", token: admin, body: { status: "vip" } })).status,
      400,
    );
  });

  it("limite à cinq demandes par adresse IP sur quinze minutes", async () => {
    const headers = { "x-forwarded-for": "203.0.113.19" };
    for (let i = 0; i < 5; i++) {
      assert.equal((await api("/api/security-quotes", { method: "POST", headers, body: validQuote() })).status, 201);
    }
    assert.equal((await api("/api/security-quotes", { method: "POST", headers, body: validQuote() })).status, 429);
  });
});
