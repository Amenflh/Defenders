import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { useApi } from "./helpers.js";

const { api, adminToken, clientToken } = useApi();

describe("discussion client ↔ équipe", () => {
  it("un visiteur anonyme ne peut pas discuter, l'admin ne peut pas utiliser la route client", async () => {
    assert.equal((await api("/api/me/chat")).status, 401);
    assert.equal((await api("/api/me/chat", { token: await adminToken() })).status, 403);
    assert.equal((await api("/api/admin/chat", { token: await clientToken() })).status, 403);
  });

  it("un client sans conversation reçoit un fil vide", async () => {
    const res = await api("/api/me/chat", { token: await clientToken() });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { conversationId: null, messages: [], adminReadAt: null });
  });

  it("refuse un message vide ou trop long", async () => {
    const token = await clientToken();
    assert.equal((await api("/api/me/chat", { method: "POST", token, body: { body: "   " } })).status, 422);
    assert.equal((await api("/api/me/chat", { method: "POST", token, body: { body: "x".repeat(2001) } })).status, 422);
  });

  it("échange complet : message du client, non-lus, réponse de l'équipe, lecture", async () => {
    const client = await clientToken();
    const admin = await adminToken();

    // 1. Le client écrit deux messages.
    const first = await api("/api/me/chat", { method: "POST", token: client, body: { body: "Bonjour, quelles sont les dates ?" } });
    assert.equal(first.status, 201);
    await api("/api/me/chat", { method: "POST", token: client, body: { body: "Et le tarif ?" } });

    // 2. L'équipe voit la conversation avec 2 messages non lus.
    const inbox = await api("/api/admin/chat", { token: admin });
    assert.equal(inbox.status, 200);
    assert.equal(inbox.body.unread, 2);
    const [conversation] = inbox.body.conversations;
    assert.equal(conversation.user.email, "client@test.local");
    assert.equal(conversation.unread, 2);
    assert.equal(conversation.lastMessage.body, "Et le tarif ?");

    // 3. Ouvrir le fil marque les messages comme lus.
    const thread = await api(`/api/admin/chat/${conversation.id}`, { token: admin });
    assert.deepEqual(thread.body.messages.map((m: { sender: string }) => m.sender), ["client", "client"]);
    assert.equal((await api("/api/admin/chat/unread", { token: admin })).body.unread, 0);

    // 4. L'équipe répond : le client a 1 message non lu.
    const reply = await api(`/api/admin/chat/${conversation.id}`, { method: "POST", token: admin, body: { body: "La prochaine session commence lundi." } });
    assert.equal(reply.status, 201);
    assert.equal((await api("/api/me/chat/unread", { token: client })).body.unread, 1);

    // 5. Rafraîchissement incrémental : ?after= ne renvoie que la suite.
    const lastSeen = thread.body.messages.at(-1).id;
    const update = await api(`/api/me/chat?after=${lastSeen}`, { token: client });
    assert.deepEqual(update.body.messages.map((m: { body: string }) => m.body), ["La prochaine session commence lundi."]);
    assert.equal((await api("/api/me/chat/unread", { token: client })).body.unread, 0, "lu après ouverture");
  });

  it("une conversation inconnue renvoie 404", async () => {
    const admin = await adminToken();
    assert.equal((await api("/api/admin/chat/99999", { token: admin })).status, 404);
    assert.equal((await api("/api/admin/chat/99999", { method: "POST", token: admin, body: { body: "?" } })).status, 404);
    assert.equal((await api("/api/admin/chat/abc", { token: admin })).status, 404);
  });

  it("limite l'envoi à 20 messages par minute et par compte", async () => {
    const res = await api("/api/auth/register", {
      method: "POST",
      body: { name: "Bavard Test", email: "bavard@test.local", phone: "+216 20 111 222", password: "Bavard-123" },
    });
    const token = res.body.token as string;
    for (let i = 0; i < 20; i++) {
      assert.equal((await api("/api/me/chat", { method: "POST", token, body: { body: `message ${i}` } })).status, 201, `message ${i + 1}`);
    }
    assert.equal((await api("/api/me/chat", { method: "POST", token, body: { body: "un de trop" } })).status, 429);
  });
});
