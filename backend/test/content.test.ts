import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prisma, useApi } from "./helpers.js";
import { ensureSeedData } from "../src/db/seed.js";

/** Contenu géré dans l'admin : formations des deux académies, historique, équipe, médias. */
describe("contenu dynamique", () => {
  const { api, adminToken, clientToken } = useApi();

  it("réserve la gestion aux administrateurs", async () => {
    const client = await clientToken();
    for (const path of ["/api/admin/history", "/api/admin/trainers"]) {
      assert.equal((await api(path)).status, 401);
      assert.equal((await api(path, { token: client })).status, 403);
    }
  });

  it("gère une entrée d'historique : création, modification, masquage, suppression", async () => {
    const token = await adminToken();
    const created = await api("/api/admin/history", { method: "POST", token, body: { academy: "tsa", title: "Session test", date: "2026-10-01", activity: "k9", videos: [{ url: "https://www.facebook.com/reel/1/" }], translations: { en: { title: "Test session" } } } });
    assert.equal(created.status, 201);
    const { id } = created.body.entry;
    assert.equal(created.body.entry.date, "2026-10-01");
    assert.equal(created.body.entry.videos[0].layout, "portrait");
    const visible = async () => (await api("/api/history?academy=tsa")).body.entries.some((e: { id: number }) => e.id === id);
    assert.equal(await visible(), true);
    assert.equal((await api("/api/history?academy=fitness")).body.entries.some((e: { id: number }) => e.id === id), false);
    assert.equal((await api(`/api/admin/history/${id}`, { method: "PATCH", token, body: { active: false } })).status, 200);
    assert.equal(await visible(), false);
    assert.equal((await api(`/api/admin/history/${id}`, { method: "DELETE", token })).status, 204);
    assert.equal((await api(`/api/admin/history/${id}`, { method: "DELETE", token })).status, 404);
  });

  it("refuse un lien dangereux ou une académie inconnue", async () => {
    const token = await adminToken();
    assert.equal((await api("/api/admin/history", { method: "POST", token, body: { academy: "autre", title: "Test" } })).status, 422);
    assert.equal((await api("/api/admin/history", { method: "POST", token, body: { academy: "tsa", title: "Test", sources: [{ url: "javascript:alert(1)" }] } })).status, 422);
    assert.equal((await api("/api/admin/trainers", { method: "POST", token, body: { name: "Test", photoUrl: "data:text/html,x" } })).status, 422);
  });

  it("présente un formateur sur son académie et sur sa formation", async () => {
    const token = await adminToken();
    const { body } = await api("/api/admin/trainers", { method: "POST", token, body: { name: "Formateur Test", academy: "fitness" } });
    const { body: created } = await api("/api/admin/formations", { method: "POST", token, body: { slug: "test-yoga", name: "Test Yoga", status: "published", academy: "fitness", accent: "k9", trainerIds: [body.trainer.id, 999_999], translations: { en: { name: "Yoga test" } } } });
    const detail = await api("/api/formations/test-yoga");
    assert.deepEqual(detail.body.formation.trainers.map((t: { name: string }) => t.name), ["Formateur Test"]);
    assert.equal(detail.body.formation.translations.en.name, "Yoga test");
    assert.equal((await api("/api/trainers?academy=tsa")).body.trainers.some((t: { name: string }) => t.name === "Formateur Test"), false);
    // Une mise à jour partielle ne touche pas aux autres champs.
    await api(`/api/admin/formations/${created.formation.id}`, { method: "PATCH", token, body: { location: "Tunis" } });
    const after = await api(`/api/admin/formations/${created.formation.id}`, { token });
    assert.equal(after.body.formation.location, "Tunis");
    assert.deepEqual(after.body.formation.trainerIds, [body.trainer.id]);
    await api(`/api/admin/formations/${created.formation.id}`, { method: "DELETE", token });
    await api(`/api/admin/trainers/${body.trainer.id}`, { method: "DELETE", token });
  });

  it("filtre les médias par académie (les médias communs restent visibles)", async () => {
    const token = await adminToken();
    const add = async (academy: string) => (await api("/api/admin/media", { method: "POST", token, body: { type: "image", url: `/pics/test-${academy || "commun"}.jpg`, category: "galerie-test", academy } })).body.media.id as number;
    const ids = { tsa: await add("tsa"), fitness: await add("fitness"), both: await add("") };
    const list = (await api("/api/media?category=galerie-test&academy=tsa")).body.media.map((m: { id: number }) => m.id);
    assert.deepEqual([list.includes(ids.tsa), list.includes(ids.fitness), list.includes(ids.both)], [true, false, true]);
    for (const id of Object.values(ids)) await api(`/api/admin/media/${id}`, { method: "DELETE", token });
  });

  it("garde le visuel d'une formation quand on retire l'image d'une galerie", async () => {
    const token = await adminToken();
    const { coverUrl, id } = await prisma.formation.findFirstOrThrow({ where: { coverUrl: { not: null } } });
    const { body } = await api("/api/admin/media", { method: "POST", token, body: { type: "image", url: coverUrl, category: "galerie-test" } });
    assert.equal((await api(`/api/admin/media/${body.media.id}`, { method: "DELETE", token })).status, 204);
    assert.equal((await prisma.formation.findUniqueOrThrow({ where: { id } })).coverUrl, coverUrl);
  });

  it("ne modifie pas les champs absents d'un contenu CMS", async () => {
    const token = await adminToken();
    const { body } = await api("/api/admin/cms", { method: "POST", token, body: { section: "testimonials", title: "Stagiaire", body: "Avis", linkUrl: "/contact", academy: "tsa" } });
    await api(`/api/admin/cms/${body.item.id}`, { method: "PATCH", token, body: { title: "Nouveau nom" } });
    const item = await prisma.cmsItem.findUniqueOrThrow({ where: { id: body.item.id } });
    assert.deepEqual([item.title, item.body, item.linkUrl, item.academy], ["Nouveau nom", "Avis", "/contact", "tsa"]);
    await prisma.cmsItem.delete({ where: { id: item.id } });
  });

  it("ne recrée jamais un contenu supprimé au redémarrage", async () => {
    const before = await prisma.cmsItem.findMany({ where: { section: "partners" } });
    assert.ok(before.length > 0);
    await prisma.cmsItem.deleteMany({ where: { section: "partners" } });
    await ensureSeedData();
    assert.equal(await prisma.cmsItem.count({ where: { section: "partners" } }), 0);
    await prisma.cmsItem.createMany({ data: before.map(({ id: _id, translations, ...item }) => ({ ...item, translations: translations ?? {} })) });
  });
});
