import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prisma, useApi, validRegistration } from "./helpers.js";

const { api, adminToken, clientToken } = useApi();

describe("formulaire d'inscription (POST /api/contact)", () => {
  it("enregistre une inscription valide avec ses formations", async () => {
    const res = await api("/api/contact", { method: "POST", body: validRegistration({ trainings: ["pilates", "football", "pilates"] }) });
    assert.equal(res.status, 201);
    const saved = await prisma.registration.findUniqueOrThrow({
      where: { id: res.body.id },
      include: { formations: { include: { formation: true } } },
    });
    assert.equal(saved.status, "nouveau");
    assert.deepEqual(saved.formations.map((f) => f.formation.slug).sort(), ["football", "pilates"], "doublons retirés");
  });

  it("enregistre une demande d'information sans formation", async () => {
    const res = await api("/api/contact", {
      method: "POST",
      body: validRegistration({ profile: "demande-info", trainings: [], availability: "non-precisee", message: "Quels tarifs ?" }),
    });
    assert.equal(res.status, 201);
  });

  it("refuse une demande d'information sans message", async () => {
    const res = await api("/api/contact", {
      method: "POST",
      body: validRegistration({ profile: "demande-info", trainings: [], availability: "non-precisee" }),
    });
    assert.equal(res.status, 422);
    assert.ok(res.body.details?.message ?? JSON.stringify(res.body).includes("message"), "erreur rattachée au champ message");
  });

  it("refuse (422) une inscription sans formation, sans consentement, ou avec un e-mail / téléphone invalide", async () => {
    for (const overrides of [{ trainings: [] }, { consent: false }, { email: "nope" }, { phone: "abc" }]) {
      const res = await api("/api/contact", { method: "POST", body: validRegistration(overrides) });
      assert.equal(res.status, 422, JSON.stringify(overrides));
    }
  });

  it("refuse une formation inconnue", async () => {
    const res = await api("/api/contact", { method: "POST", body: validRegistration({ trainings: ["formation-inexistante"] }) });
    assert.equal(res.status, 422);
  });

  it("le champ piège anti-spam répond OK sans rien enregistrer", async () => {
    const before = await prisma.registration.count();
    const res = await api("/api/contact", { method: "POST", body: validRegistration({ website: "http://spam.example" }) });
    assert.equal(res.status, 202);
    assert.equal(await prisma.registration.count(), before);
  });

  it("rattache la demande au compte du client connecté", async () => {
    const token = await clientToken();
    const res = await api("/api/contact", { method: "POST", token, body: validRegistration({ email: "client@test.local" }) });
    assert.equal(res.status, 201);
    const mine = await api("/api/me/inscriptions", { token });
    assert.equal(mine.status, 200);
    assert.ok(mine.body.inscriptions.some((r: { id: string }) => r.id === res.body.id));
  });
});

describe("gestion des demandes (admin)", () => {
  it("liste les demandes et change leur statut", async () => {
    const token = await adminToken();
    const created = await api("/api/contact", { method: "POST", body: validRegistration({ email: "statut@test.local" }) });

    const list = await api("/api/admin/contacts", { token });
    assert.equal(list.status, 200);

    const patched = await api(`/api/admin/contacts/${created.body.id}`, { method: "PATCH", token, body: { status: "inscrit" } });
    assert.equal(patched.status, 200);
    assert.equal(patched.body.contact.status, "inscrit");

    const filtered = await api("/api/admin/contacts?status=inscrit", { token });
    assert.equal(filtered.status, 200);
    assert.ok(JSON.stringify(filtered.body).includes(created.body.id));
  });

  it("refuse un statut inconnu ou un identifiant invalide", async () => {
    const token = await adminToken();
    assert.equal((await api("/api/admin/contacts/pas-un-uuid", { method: "PATCH", token, body: { status: "inscrit" } })).status, 400);
    const created = await api("/api/contact", { method: "POST", body: validRegistration() });
    assert.equal((await api(`/api/admin/contacts/${created.body.id}`, { method: "PATCH", token, body: { status: "vip" } })).status, 400);
  });
});

describe("anti-spam", () => {
  it("limite le formulaire à 10 envois par IP sur 15 minutes", async () => {
    const headers = { "x-forwarded-for": "203.0.113.7" };
    for (let i = 0; i < 10; i++) {
      const res = await api("/api/contact", { method: "POST", headers, body: validRegistration() });
      assert.equal(res.status, 201, `envoi ${i + 1}`);
    }
    assert.equal((await api("/api/contact", { method: "POST", headers, body: validRegistration() })).status, 429);
  });
});
