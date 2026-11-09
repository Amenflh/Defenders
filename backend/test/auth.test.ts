import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ADMIN, useApi } from "./helpers.js";

const { api, adminToken, clientToken } = useApi();

describe("connexion", () => {
  it("renvoie un jeton et le profil admin avec les bons identifiants", async () => {
    const res = await api("/api/auth/login", { method: "POST", body: ADMIN });
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.token, "string");
    assert.equal(res.body.user.role, "admin");
    assert.equal(res.body.user.passwordHash, undefined, "le hash ne doit jamais sortir de l'API");
  });

  it("refuse un mauvais mot de passe (401)", async () => {
    const res = await api("/api/auth/login", { method: "POST", body: { ...ADMIN, password: "mauvais" } });
    assert.equal(res.status, 401);
  });

  it("refuse un corps invalide (400)", async () => {
    const res = await api("/api/auth/login", { method: "POST", body: { email: "pas-un-email" } });
    assert.equal(res.status, 400);
  });

  it("GET /api/auth/me exige un jeton valide", async () => {
    assert.equal((await api("/api/auth/me")).status, 401);
    assert.equal((await api("/api/auth/me", { token: "faux.jeton.jwt" })).status, 401);
    const me = await api("/api/auth/me", { token: await adminToken() });
    assert.equal(me.status, 200);
  });

  it("la déconnexion révoque le jeton", async () => {
    const { body } = await api("/api/auth/login", { method: "POST", body: ADMIN });
    assert.equal((await api("/api/auth/logout", { method: "POST", token: body.token })).status, 204);
    assert.equal((await api("/api/auth/me", { token: body.token })).status, 401);
  });
});

describe("rôles", () => {
  it("un client ne peut pas accéder à l'administration (403)", async () => {
    const token = await clientToken();
    assert.equal((await api("/api/admin/contacts", { token })).status, 403);
    assert.equal((await api("/api/admin/stats", { token })).status, 403);
  });

  it("un visiteur anonyme reçoit 401 sur l'administration", async () => {
    for (const path of ["/api/admin/contacts", "/api/admin/stats", "/api/admin/formations", "/api/admin/media"]) {
      assert.equal((await api(path)).status, 401, path);
    }
  });
});

describe("limite de tentatives par compte", () => {
  it("bloque un compte après 10 échecs, même en changeant d'IP (X-Forwarded-For)", async () => {
    const body = { email: "cible@test.local", password: "mauvais" };
    for (let i = 0; i < 10; i++) {
      const res = await api("/api/auth/login", { method: "POST", body, headers: { "x-forwarded-for": `10.0.0.${i}` } });
      assert.equal(res.status, 401, `tentative ${i + 1}`);
    }
    const blocked = await api("/api/auth/login", { method: "POST", body, headers: { "x-forwarded-for": "10.0.1.99" } });
    assert.equal(blocked.status, 429);
  });
});
