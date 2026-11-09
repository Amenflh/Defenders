import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeUrl } from "../src/modules/cms/cms.routes.js";
import { formationSlugSchema } from "../src/modules/formations/formations.schemas.js";
import { prisma, useApi } from "./helpers.js";

const { api, adminToken } = useApi();

const DAY = 86_400_000;
const ago = (days: number, hours = 0) => new Date(Date.now() - days * DAY - hours * 3_600_000);

/** Insère une demande directement en base, à une date passée. */
async function seedRegistration(createdAt: Date, data: { profile?: string; status?: "nouveau" | "contacte" | "inscrit" | "archive"; city?: string; formation?: string } = {}) {
  const formation = data.formation ? await prisma.formation.findUniqueOrThrow({ where: { slug: data.formation } }) : null;
  return prisma.registration.create({
    data: {
      createdAt,
      firstName: "Test",
      lastName: "Stats",
      email: "stats@test.local",
      phone: "22333444",
      city: data.city ?? "Tunis",
      profile: data.profile ?? "coach-pro",
      availability: "semaine",
      status: data.status ?? "nouveau",
      ...(formation ? { formations: { create: [{ formationId: formation.id }] } } : {}),
    },
  });
}

describe("statistiques du tableau de bord (GET /api/admin/stats)", () => {
  it("agrège la période courante et la compare à la précédente", async () => {
    // Période courante (30 j) : 3 inscriptions + 1 demande d'info. Période précédente : 2 inscriptions.
    await seedRegistration(ago(1), { formation: "pilates", status: "inscrit", city: "hammamet" });
    await seedRegistration(ago(3), { formation: "pilates", status: "contacte", city: "Hammamet" });
    await seedRegistration(ago(5), { formation: "football", city: "Sousse" }); // « nouveau » depuis 5 j → à relancer
    await seedRegistration(ago(2), { profile: "demande-info" });
    await seedRegistration(ago(40), { formation: "football" });
    await seedRegistration(ago(45), { formation: "football", status: "inscrit" });

    const res = await api("/api/admin/stats?days=30", { token: await adminToken() });
    assert.equal(res.status, 200);
    const { kpis, funnel, topFormations, cities, series, followUps } = res.body;

    assert.deepEqual(kpis.total, { value: 4, trend: 100 });
    assert.deepEqual(kpis.registrations, { value: 3, trend: 50 });
    assert.equal(kpis.inquiries.value, 1);
    assert.deepEqual(kpis.enrolled, { value: 1, trend: 0 });
    assert.equal(kpis.conversionRate, 25);
    assert.equal(kpis.processingRate, 50);

    assert.deepEqual(funnel.map((s: { count: number }) => s.count), [2, 1, 1, 0]);
    assert.equal(topFormations[0].slug, "pilates");
    assert.equal(topFormations[0].count, 2);
    assert.deepEqual(cities[0], { label: "Hammamet", count: 2 }, "villes regroupées sans tenir compte de la casse");

    assert.equal(series.length, 30, "un point par jour, jours vides inclus");
    const sum = series.reduce((n: number, p: { registrations: number; inquiries: number }) => n + p.registrations + p.inquiries, 0);
    assert.equal(sum, 4);

    // Relances : demandes « nouveau » de plus de 48 h, toutes périodes confondues (5 j, 2 j, 40 j).
    assert.equal(followUps.total, 3);
    assert.equal(followUps.items[0].formations[0], "Football", "la plus ancienne en premier");
  });

  it("valide la période demandée", async () => {
    const token = await adminToken();
    assert.equal((await api("/api/admin/stats?days=3", { token })).status, 400);
    assert.equal((await api("/api/admin/stats?days=1000", { token })).status, 400);
    assert.equal((await api("/api/admin/stats", { token })).body.days, 30, "30 jours par défaut");
  });
});

describe("contenus (CMS)", () => {
  it("refuse une clé de réglage invalide", async () => {
    const token = await adminToken();
    assert.equal((await api("/api/admin/settings/..%2Fetc", { token })).status, 400);
    assert.equal((await api("/api/admin/settings/site", { token })).status, 200);
  });

  it("refuse un lien javascript: dans un élément du CMS", async () => {
    const token = await adminToken();
    const res = await api("/api/admin/cms", {
      method: "POST",
      token,
      body: { section: "partners", title: "Partenaire", linkUrl: "javascript:alert(1)" },
    });
    assert.equal(res.status, 422);
  });

  it("safeUrl n'accepte que des liens sûrs", () => {
    for (const ok of ["", "/contact", "https://defenders.tn", "mailto:a@b.tn", "tel:+21692204005"]) {
      assert.ok(safeUrl.safeParse(ok).success, ok);
    }
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "ftp://x"]) {
      assert.ok(!safeUrl.safeParse(bad).success, bad);
    }
  });
});

describe("formations", () => {
  it("les slugs réservés aux pages du site sont refusés", () => {
    for (const slug of ["admin", "contact", "trouver-ma-formation", "api"]) {
      assert.ok(!formationSlugSchema.safeParse(slug).success, slug);
    }
    assert.ok(formationSlugSchema.safeParse("crossfit").success);
  });

  it("la liste publique ne renvoie que des formations publiées", async () => {
    const res = await api("/api/formations");
    assert.equal(res.status, 200);
    assert.ok(res.body.formations.length >= 3);
    assert.ok(res.body.formations.every((f: { slug: string }) => typeof f.slug === "string"));
  });

  it("l'ancienne route /api/content/formations n'existe plus", async () => {
    assert.equal((await api("/api/content/formations")).status, 404);
  });
});
