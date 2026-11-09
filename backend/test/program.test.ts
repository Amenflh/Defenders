import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prisma, useApi, validRegistration } from "./helpers.js";

const { api, url, adminToken, clientToken, newClient } = useApi();

/** Demande d'inscription envoyée par un client connecté ; renvoie son id. */
async function register(token: string, overrides: Record<string, unknown> = {}) {
  const res = await api("/api/contact", { method: "POST", token, body: validRegistration(overrides) });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.id as string;
}

/** Paie l'acompte en mode simulation (comme le ferait la page de paiement factice). */
async function payDeposit(token: string, registrationId: string) {
  const start = await api("/api/me/payments", { method: "POST", token, body: { registrationId } });
  assert.equal(start.status, 201, JSON.stringify(start.body));
  const ref = new URL(start.body.payUrl).searchParams.get("ref")!;
  const settled = await api(`/api/payments/simulation/${ref}`, { method: "POST", body: { outcome: "paid" } });
  assert.equal(settled.body.status, "paid");
  return ref;
}

const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");

async function uploadResource(fields: Record<string, string>, file?: { name: string; content: Buffer; type: string }) {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  if (file) form.set("file", new Blob([new Uint8Array(file.content)], { type: file.type }), file.name);
  const res = await fetch(url("/api/admin/resources"), { method: "POST", body: form, headers: { authorization: `Bearer ${await adminToken()}` } });
  return { status: res.status, body: (await res.json()) as any };
}

describe("acompte en ligne", () => {
  it("la configuration publique indique le mode simulation et le montant par défaut", async () => {
    const res = await api("/api/payments/config");
    assert.deepEqual(res.body, { enabled: true, depositTnd: 100, mode: "simulation" });
  });

  it("paiement complet : la demande passe « inscrit », un second paiement est refusé", async () => {
    const token = await clientToken();
    const id = await register(token, { email: "client@test.local" });

    const ref = await payDeposit(token, id);
    const registration = await prisma.registration.findUniqueOrThrow({ where: { id } });
    assert.equal(registration.status, "inscrit");

    const mine = await api("/api/me/payments", { token });
    assert.equal(mine.body.payments[0].status, "paid");
    assert.equal(mine.body.payments[0].amountMillimes, 100_000);

    // Idempotent : une nouvelle vérification ou un « échec » tardif ne change rien.
    assert.equal((await api("/api/payments/verify", { method: "POST", body: { ref } })).body.status, "paid");
    assert.equal((await api(`/api/payments/simulation/${ref}`, { method: "POST", body: { outcome: "failed" } })).body.status, "paid");

    assert.equal((await api("/api/me/payments", { method: "POST", token, body: { registrationId: id } })).status, 409);
  });

  it("refuse de payer la demande d'un autre client (404) et exige un compte client", async () => {
    const owner = await newClient("Proprio Test", "proprio@test.local");
    const id = await register(owner, { email: "proprio@test.local" });
    const intruder = await newClient("Intrus Test", "intrus@test.local");
    assert.equal((await api("/api/me/payments", { method: "POST", token: intruder, body: { registrationId: id } })).status, 404);
    assert.equal((await api("/api/me/payments", { method: "POST", token: await adminToken(), body: { registrationId: id } })).status, 403);
    assert.equal((await api("/api/me/payments", { method: "POST", body: { registrationId: id } })).status, 401);
  });

  it("un paiement échoué laisse la demande inchangée et peut être retenté", async () => {
    const token = await newClient("Echec Test", "echec@test.local");
    const id = await register(token, { email: "echec@test.local" });
    const start = await api("/api/me/payments", { method: "POST", token, body: { registrationId: id } });
    const ref = new URL(start.body.payUrl).searchParams.get("ref")!;
    assert.equal((await api(`/api/payments/simulation/${ref}`, { method: "POST", body: { outcome: "failed" } })).body.status, "failed");
    assert.equal((await prisma.registration.findUniqueOrThrow({ where: { id } })).status, "nouveau");
    await payDeposit(token, id);
  });

  it("l'admin voit les paiements et le total encaissé ; un acompte à 0 désactive le paiement", async () => {
    const admin = await adminToken();
    const list = await api("/api/admin/payments", { token: admin });
    assert.equal(list.status, 200);
    assert.equal(list.body.totals.paidCount, 2);
    assert.equal(list.body.totals.paidMillimes, 200_000);
    assert.ok(list.body.payments.some((p: { status: string }) => p.status === "failed"));

    assert.equal((await api("/api/admin/settings/paiements", { method: "PUT", token: admin, body: { depositTnd: 0, referralRewardTnd: 50 } })).status, 200);
    assert.equal((await api("/api/payments/config")).body.enabled, false);
    const token = await newClient("Sans Acompte", "sans@test.local");
    const id = await register(token, { email: "sans@test.local" });
    assert.equal((await api("/api/me/payments", { method: "POST", token, body: { registrationId: id } })).status, 503);
    await api("/api/admin/settings/paiements", { method: "PUT", token: admin, body: { depositTnd: 100, referralRewardTnd: 50 } });
  });
});

describe("parrainage", () => {
  it("lien, filleul, inscription du filleul puis bonus versé par l'admin", async () => {
    const parrain = await newClient("Sami Parrain", "parrain@test.local");
    const mine = await api("/api/me/referral", { token: parrain });
    assert.equal(mine.status, 200);
    assert.match(mine.body.code, /^SAMI[A-Z0-9]{4}$/);
    assert.equal((await api("/api/me/referral", { token: parrain })).body.code, mine.body.code, "code stable");
    assert.deepEqual((await api(`/api/referrals/${mine.body.code.toLowerCase()}`)).body, { firstName: "Sami" });

    // L'ami s'inscrit avec le code, puis paie son acompte.
    const ami = await newClient("Lina Filleule", "lina@test.local");
    const id = await register(ami, { email: "lina@test.local", firstName: "Lina", lastName: "Filleule", referralCode: mine.body.code });
    let stats = (await api("/api/me/referral", { token: parrain })).body;
    assert.deepEqual(stats.referrals.map((r: { name: string; reward: string }) => [r.name, r.reward]), [["Lina F.", "en_attente"]]);

    await payDeposit(ami, id);
    stats = (await api("/api/me/referral", { token: parrain })).body;
    assert.equal(stats.referrals[0].reward, "a_verser");
    assert.deepEqual(stats.stats, { invited: 1, enrolled: 1, earnedTnd: 50, pendingTnd: 50 });

    // L'équipe voit le bonus à verser et le marque comme versé.
    const admin = await adminToken();
    const adminList = await api("/api/admin/referrals", { token: admin });
    assert.equal(adminList.body.totals.due, 1);
    assert.equal(adminList.body.referrals[0].referrer.email, "parrain@test.local");
    const granted = await api(`/api/admin/referrals/${id}`, { method: "PATCH", token: admin, body: { granted: true } });
    assert.equal(granted.body.reward, "verse");
    assert.equal((await api("/api/me/referral", { token: parrain })).body.stats.pendingTnd, 0);
  });

  it("ignore l'auto-parrainage et les codes inconnus, sans bloquer la demande", async () => {
    const solo = await newClient("Solo Test", "solo@test.local");
    const { code } = (await api("/api/me/referral", { token: solo })).body;
    const selfId = await register(solo, { email: "solo@test.local", referralCode: code });
    const unknownId = await register(solo, { email: "solo@test.local", referralCode: "ZZZZ9999" });
    const rows = await prisma.registration.findMany({ where: { id: { in: [selfId, unknownId] } }, select: { referrerId: true } });
    assert.ok(rows.every((r) => r.referrerId === null));
    assert.equal((await api("/api/referrals/ZZZZ9999")).status, 404);
  });

  it("refuse de verser le bonus d'un filleul pas encore inscrit", async () => {
    const parrain = await newClient("Karim Parrain", "karim@test.local");
    const { code } = (await api("/api/me/referral", { token: parrain })).body;
    const id = await register(await newClient("Ami Attente", "attente@test.local"), { email: "attente@test.local", referralCode: code });
    assert.equal((await api(`/api/admin/referrals/${id}`, { method: "PATCH", token: await adminToken(), body: { granted: true } })).status, 400);
  });
});

describe("ressources réservées aux inscrits", () => {
  it("dépôt, accès verrouillé puis ouvert après inscription, fichier protégé", async () => {
    const pilates = await prisma.formation.findUniqueOrThrow({ where: { slug: "pilates" } });
    const football = await prisma.formation.findUniqueOrThrow({ where: { slug: "football" } });

    const pdf = await uploadResource({ title: "Programme Pilates", formationId: String(pilates.id) }, { name: "programme pilates.pdf", content: PDF, type: "application/pdf" });
    assert.equal(pdf.status, 201, JSON.stringify(pdf.body));
    assert.equal(pdf.body.resource.mime, "application/pdf");
    const foot = await uploadResource({ title: "Vidéo tactique", formationId: String(football.id), url: "https://youtu.be/exemple" });
    assert.equal(foot.body.resource.kind, "link");
    const general = await uploadResource({ title: "Règlement intérieur", formationId: "" }, { name: "reglement.pdf", content: PDF, type: "application/pdf" });

    // Un faux PDF (texte) est refusé ; un lien javascript: aussi.
    assert.equal((await uploadResource({ title: "Piège" }, { name: "x.pdf", content: Buffer.from("<script>alert(1)</script>"), type: "application/pdf" })).status, 422);
    assert.equal((await uploadResource({ title: "Piège", url: "javascript:alert(1)" })).status, 422);

    const token = await newClient("Stagiaire Test", "stagiaire@test.local");
    const fileUrl = (id: number) => url(`/api/me/resources/${id}/file`);
    const download = (id: number) => fetch(fileUrl(id), { headers: { authorization: `Bearer ${token}` } });

    // Pas encore inscrit : tout est verrouillé, le fichier est refusé.
    let list = (await api("/api/me/resources", { token })).body;
    assert.equal(list.enrolled, false);
    assert.ok(list.resources.every((r: { locked: boolean; url: string | null }) => r.locked && r.url === null));
    assert.equal((await download(pdf.body.resource.id)).status, 403);

    // Inscrit en Pilates (acompte payé) : Pilates + général ouverts, Football reste verrouillé.
    const id = await register(token, { email: "stagiaire@test.local", trainings: ["pilates"] });
    await payDeposit(token, id);
    list = (await api("/api/me/resources", { token })).body;
    const state = Object.fromEntries(list.resources.map((r: { title: string; locked: boolean }) => [r.title, r.locked]));
    assert.deepEqual(state, { "Programme Pilates": false, "Vidéo tactique": true, "Règlement intérieur": false });

    const file = await download(pdf.body.resource.id);
    assert.equal(file.status, 200);
    assert.equal(file.headers.get("content-type"), "application/pdf");
    assert.match(file.headers.get("content-disposition") ?? "", /programme%20pilates\.pdf/);
    assert.deepEqual(Buffer.from(await file.arrayBuffer()), PDF);
    assert.equal((await download(general.body.resource.id)).status, 200);

    // Le dossier privé n'est jamais servi en statique.
    assert.equal((await fetch(url("/uploads/resources/x.pdf"))).status, 404);

    // Ressource désactivée puis supprimée : plus accessible.
    const admin = await adminToken();
    await api(`/api/admin/resources/${pdf.body.resource.id}`, { method: "PATCH", token: admin, body: { active: false } });
    assert.equal((await download(pdf.body.resource.id)).status, 404);
    assert.equal((await api(`/api/admin/resources/${pdf.body.resource.id}`, { method: "DELETE", token: admin })).status, 204);
    assert.equal((await api("/api/admin/resources", { token: admin })).body.resources.length, 2);
  });

  it("réservé : anonyme 401, admin 403 côté client, client 403 côté admin", async () => {
    assert.equal((await api("/api/me/resources")).status, 401);
    assert.equal((await api("/api/me/resources", { token: await adminToken() })).status, 403);
    assert.equal((await api("/api/admin/resources", { token: await clientToken() })).status, 403);
  });
});
