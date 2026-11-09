import { randomUUID } from "node:crypto";
import { config } from "../../config.js";
import { HttpError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export type ProviderStatus = "paid" | "pending" | "failed";
export type InitInput = {
  amountMillimes: number;
  orderId: string;
  description: string;
  payer: { firstName: string; lastName: string; email: string; phone: string };
  /** URL appelée par le prestataire (et vers laquelle le payeur est renvoyé) avec ?payment_ref=… */
  returnUrl: string;
};

export interface PaymentProvider {
  readonly name: "konnect" | "simulation";
  init(input: InitInput): Promise<{ ref: string; payUrl: string }>;
  /** Statut réel, demandé au prestataire : un webhook ou un retour navigateur ne suffit jamais à valider. */
  status(ref: string): Promise<ProviderStatus>;
}

/**
 * Konnect (https://docs.konnect.network) :
 * - POST /payments/init-payment (en-tête x-api-key, montant en millimes) → { payUrl, paymentRef }
 * - Konnect appelle ensuite le « webhook » en GET avec ?payment_ref=… (et y renvoie le payeur) ;
 * - le statut se vérifie par GET /payments/{paymentRef} : seul « completed » vaut paiement.
 */
class KonnectProvider implements PaymentProvider {
  readonly name = "konnect" as const;

  private async call<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${config.konnect.apiUrl}${path}`, {
      ...init,
      signal: AbortSignal.timeout(15_000),
      headers: { "x-api-key": config.konnect.apiKey, "content-type": "application/json", ...init.headers },
    }).catch((err: unknown) => {
      console.error("[paiement] Konnect injoignable", err);
      throw new HttpError(502, "Le service de paiement ne répond pas. Réessayez dans un instant.");
    });
    if (!res.ok) {
      console.error(`[paiement] Konnect ${path} → ${res.status}`, await res.text().catch(() => ""));
      throw new HttpError(502, "Le service de paiement a refusé la demande. Réessayez plus tard.");
    }
    return (await res.json()) as T;
  }

  async init(input: InitInput) {
    const data = await this.call<{ payUrl: string; paymentRef: string }>("/payments/init-payment", {
      method: "POST",
      body: JSON.stringify({
        receiverWalletId: config.konnect.walletId,
        token: "TND",
        amount: input.amountMillimes,
        type: "immediate",
        description: input.description,
        acceptedPaymentMethods: ["bank_card", "wallet", "e-DINAR"],
        lifespan: 30,
        checkoutForm: false,
        addPaymentFeesToAmount: false,
        firstName: input.payer.firstName,
        lastName: input.payer.lastName,
        phoneNumber: input.payer.phone.replace(/[^\d+]/g, ""),
        email: input.payer.email,
        orderId: input.orderId,
        webhook: input.returnUrl,
        theme: "dark",
      }),
    });
    return { ref: data.paymentRef, payUrl: data.payUrl };
  }

  async status(ref: string): Promise<ProviderStatus> {
    const data = await this.call<{ payment?: { status?: string } }>(`/payments/${encodeURIComponent(ref)}`);
    const status = data.payment?.status?.toLowerCase();
    if (status === "completed") return "paid";
    // Statuts d'échec explicites seulement : tout statut inconnu reste « en attente » (jamais validé par erreur).
    if (status && ["failed", "expired", "canceled", "cancelled", "rejected"].includes(status)) return "failed";
    return "pending";
  }
}

/**
 * Simulation (développement et tests, jamais en production) : page de paiement factice du site,
 * le résultat est enregistré par POST /api/payments/simulation/:ref.
 */
class SimulationProvider implements PaymentProvider {
  readonly name = "simulation" as const;

  async init(input: InitInput) {
    const ref = `sim_${randomUUID()}`;
    return { ref, payUrl: `${config.siteUrl}/paiement/simulation?ref=${ref}&amount=${input.amountMillimes}` };
  }

  async status(ref: string): Promise<ProviderStatus> {
    const payment = await prisma.payment.findUnique({ where: { providerRef: ref }, select: { status: true } });
    return payment?.status ?? "pending";
  }
}

/** Prestataire actif : Konnect si configuré ; sinon simulation hors production ; sinon aucun (paiement désactivé). */
export function activeProvider(): PaymentProvider | null {
  if (config.konnect.apiKey && config.konnect.walletId) return new KonnectProvider();
  if (!config.isProduction) return new SimulationProvider();
  return null;
}
