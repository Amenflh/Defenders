import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { after, before } from "node:test";
import { createApp } from "../src/app.js";
import { ensureSeedData } from "../src/db/seed.js";
import { prisma } from "../src/lib/prisma.js";

export { prisma };

export const ADMIN = { email: "admin@test.local", password: "Admin-test-123" };

type Options = { method?: string; body?: unknown; token?: string; headers?: Record<string, string> };
export type Api = (path: string, options?: Options) => Promise<{ status: number; body: any }>;

/** Vide les données de test (formations et réglages de référence conservés), puis recrée l'admin. */
async function ignoreMissingTable<T>(operation: Promise<T>): Promise<T | undefined> {
  try {
    return await operation;
  } catch (err) {
    const code = typeof err === "object" && err && "code" in err ? String((err as { code?: string }).code) : "";
    if (code === "P2021") return undefined;
    throw err;
  }
}

export async function resetDb(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await ignoreMissingTable(tx.payment.deleteMany());
    await ignoreMissingTable(tx.chatMessage.deleteMany());
    await ignoreMissingTable(tx.conversation.deleteMany());
    await ignoreMissingTable(tx.registrationFormation.deleteMany());
    await ignoreMissingTable(tx.resource.deleteMany());
    await ignoreMissingTable(tx.securityQuoteRequest.deleteMany());
    await ignoreMissingTable(tx.registration.deleteMany());
    await ignoreMissingTable(tx.authSession.deleteMany());
    await ignoreMissingTable(tx.user.deleteMany());
    await ignoreMissingTable(tx.siteSetting.deleteMany({ where: { key: "paiements" } }));
  });
  await ensureSeedData();
}

/**
 * Démarre l'API sur un port libre pour le fichier de test courant et renvoie un client HTTP minimal.
 * La base est remise à zéro avant les tests du fichier.
 */
export function useApi(): {
  api: Api;
  /** URL complète (pour un envoi multipart ou une réponse binaire). */
  url: (path: string) => string;
  adminToken: () => Promise<string>;
  clientToken: () => Promise<string>;
  /** Crée un autre compte client et renvoie son jeton. */
  newClient: (name: string, email: string) => Promise<string>;
} {
  let base = "";
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;

  before(async () => {
    await resetDb();
    server = createApp().listen(0, "127.0.0.1");
    await once(server, "listening");
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  after(async () => {
    server?.close();
    await prisma.$disconnect();
  });

  let requestCount = 0;
  const api: Api = async (path, { method = "GET", body, token, headers = {} } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        // Une IP différente par requête : les limites par IP ne gênent pas les autres tests
        // (un test de limite fixe sa propre IP via `headers`).
        "x-forwarded-for": `198.51.100.${requestCount++ % 250}`,
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      /* réponse non JSON */
    }
    return { status: res.status, body: parsed };
  };

  let admin: string | undefined;
  let client: string | undefined;

  const newClient = async (name: string, email: string) => {
    const res = await api("/api/auth/register", { method: "POST", body: { name, email, phone: "+216 20 333 444", password: "Client-123" } });
    return res.body.token as string;
  };

  return {
    api,
    url: (path: string) => base + path,
    newClient,
    adminToken: async () => {
      if (!admin) admin = (await api("/api/auth/login", { method: "POST", body: ADMIN })).body.token as string;
      return admin;
    },
    clientToken: async () => {
      if (!client) {
        const res = await api("/api/auth/register", {
          method: "POST",
          body: { name: "Client Test", email: "client@test.local", phone: "+216 20 000 000", password: "Client-123" },
        });
        client = res.body.token as string;
      }
      return client;
    },
  };
}

/** Demande valide pour POST /api/contact (à surcharger champ par champ). */
export const validRegistration = (overrides: Record<string, unknown> = {}) => ({
  firstName: "Sami",
  lastName: "Ben Ali",
  email: "sami@test.local",
  phone: "+216 22 333 444",
  city: "Hammamet",
  profile: "coach-pro",
  trainings: ["pilates"],
  message: "",
  consent: true,
  rulesAccepted: true,
  ...overrides,
});
