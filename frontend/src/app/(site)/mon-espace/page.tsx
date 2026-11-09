import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatThread } from "@/components/chat/ChatThread";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { STATUS_CLIENT_LABELS, TRAINING_LABELS, dateFmt } from "@/lib/labels";
import { formatSize, millimesToTnd, type ClientResource, type MyPayment, type MyReferral, type PaymentConfig } from "@/lib/program";
import { apiFetch, getCurrentUser, publicOrigin } from "@/lib/session";
import { getMyThreadAction, sendMyMessageAction } from "../chat-actions";
import { DepositButton } from "./DepositButton";
import { ReferralPanel } from "./ReferralPanel";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };

type Inscription = { id: string; createdAt: string; trainings: string[]; status: string; availability: string };

/** Lecture JSON tolérante : une section indisponible n'empêche pas d'afficher les autres. */
async function load<T>(path: string): Promise<T | null> {
  const res = await apiFetch(path).catch(() => null);
  return res?.ok ? ((await res.json()) as T) : null;
}

const PAYMENT_BANNERS: Record<string, { tone: string; text: string }> = {
  paid: { tone: "border-football/50 bg-football/10", text: "Paiement reçu, merci ! Votre place est réservée et vos supports de formation sont débloqués." },
  failed: { tone: "border-red-500/50 bg-red-500/10", text: "Le paiement n'a pas abouti. Aucun montant n'a été débité : vous pouvez réessayer." },
  pending: { tone: "border-gold/50 bg-gold/10", text: "Paiement en cours de confirmation. Rechargez la page dans quelques instants." },
  error: { tone: "border-red-500/50 bg-red-500/10", text: "Impossible de vérifier le paiement pour le moment. Si vous avez été débité, contactez-nous." },
};

export default async function MonEspacePage({ searchParams }: PageProps<"/mon-espace">) {
  const user = await getCurrentUser();
  if (user === null) redirect("/login?next=/mon-espace");
  if (user !== "unavailable" && user.role === "admin") redirect("/admin");
  const { paiement } = await searchParams;
  const banner = typeof paiement === "string" ? PAYMENT_BANNERS[paiement] : undefined;

  const online = user !== "unavailable";
  const [inscriptionsData, paymentConfig, paymentsData, referral, resourcesData, origin] = await Promise.all([
    online ? load<{ inscriptions: Inscription[] }>("/api/me/inscriptions") : null,
    online ? load<PaymentConfig>("/api/payments/config") : null,
    online ? load<{ payments: MyPayment[] }>("/api/me/payments") : null,
    online ? load<MyReferral>("/api/me/referral") : null,
    online ? load<{ enrolled: boolean; resources: ClientResource[] }>("/api/me/resources") : null,
    publicOrigin(),
  ]);
  const inscriptions = inscriptionsData?.inscriptions ?? null;
  const paidByRegistration = new Map((paymentsData?.payments ?? []).filter((p) => p.status === "paid").map((p) => [p.registrationId, p]));
  const firstName = user === "unavailable" ? "" : user.name.split(" ")[0];

  // Supports regroupés par formation (« Tous les stagiaires » pour les supports généraux).
  const groups = new Map<string, ClientResource[]>();
  for (const r of resourcesData?.resources ?? []) {
    const key = r.formation?.name ?? "Tous les stagiaires";
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }

  return (
    <>
      <PageIntro eyebrow="Mon espace" title={firstName ? `Bonjour ${firstName}` : "Mon espace"}>
        Suivez vos demandes, réservez votre place, retrouvez vos supports de formation et échangez avec l&apos;équipe Defenders Fitness Academy.
      </PageIntro>

      <nav aria-label="Sections de mon espace" className="sticky top-16 z-20 border-b border-line bg-ink/90 backdrop-blur-md">
        <div className="container-site flex gap-1 overflow-x-auto py-2 text-xs tracking-[0.14em] uppercase">
          {[["#inscriptions", "Inscriptions"], ["#ressources", "Supports"], ["#parrainage", "Parrainage"], ["#messages", "Messages"]].map(([href, label]) => (
            <a key={href} href={href} className="shrink-0 px-3 py-2 text-mist hover:text-gold">{label}</a>
          ))}
        </div>
      </nav>

      <section id="inscriptions" className="scroll-mt-32 py-16">
        <div className="container-site">
          {banner && <p role="status" className={`mb-8 border px-5 py-4 text-sm text-bone ${banner.tone}`}>{banner.text}</p>}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl tracking-wide uppercase">Mes inscriptions</h2>
            <Link href="/contact" className="btn btn-primary">
              Nouvelle inscription <Icon name="arrow" />
            </Link>
          </div>

          {inscriptions === null ? (
            <p className="text-mist">Impossible de charger vos inscriptions pour le moment.</p>
          ) : inscriptions.length === 0 ? (
            <div className="border border-line bg-ink-2 p-10 text-center">
              <p className="text-mist">Vous n&apos;avez encore envoyé aucune demande d&apos;inscription.</p>
              <Link href="/#formations" className="btn btn-ghost mt-6">Découvrir nos formations</Link>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {inscriptions.map((i) => {
                const s = STATUS_CLIENT_LABELS[i.status] ?? STATUS_CLIENT_LABELS.nouveau;
                const paid = paidByRegistration.get(i.id);
                const canPay = !paid && paymentConfig?.enabled && (i.status === "nouveau" || i.status === "contacte");
                return (
                  <li key={i.id} className="border border-line bg-ink-2 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-display text-2xl tracking-wide uppercase">
                        {i.trainings.map((t) => TRAINING_LABELS[t] ?? t).join(" · ")}
                      </h3>
                      <span className={`border px-3 py-1 text-xs tracking-[0.15em] uppercase ${s.tone}`}>{s.label}</span>
                    </div>
                    <p className="mt-3 text-sm text-mist">{s.text}</p>
                    <p className="mt-4 text-xs text-mist/70">Envoyée le {dateFmt.format(new Date(i.createdAt))}</p>
                    {paid && (
                      <p className="mt-5 flex items-center gap-2 border-t border-line pt-5 text-sm text-football">
                        <Icon name="check" width={18} height={18} /> Acompte de {millimesToTnd(paid.amountMillimes)} payé
                        {paid.paidAt ? ` le ${dateFmt.format(new Date(paid.paidAt))}` : ""}
                      </p>
                    )}
                    {canPay && <DepositButton registrationId={i.id} amountTnd={paymentConfig.depositTnd} simulation={paymentConfig.mode === "simulation"} />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {resourcesData && resourcesData.resources.length > 0 && (
        <section id="ressources" className="scroll-mt-32 border-t border-line py-16">
          <div className="container-site">
            <h2 className="font-display text-2xl tracking-wide uppercase">Mes supports de formation</h2>
            <p className="mt-2 text-sm text-mist">
              {resourcesData.enrolled
                ? "Programmes, fiches et vidéos de vos formations, disponibles à tout moment."
                : "Ces supports se débloquent dès que votre inscription est confirmée (acompte payé)."}
            </p>
            <div className="mt-8 space-y-10">
              {[...groups.entries()].map(([group, items]) => (
                <div key={group}>
                  <h3 className="mb-4 text-xs tracking-[0.18em] text-gold uppercase">{group}</h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((r) => {
                      const meta = r.kind === "link" ? "Lien externe" : [r.mime === "application/pdf" ? "PDF" : r.mime?.startsWith("video/") ? "Vidéo" : "Image", formatSize(r.size)].filter(Boolean).join(" · ");
                      const body = (
                        <>
                          <span className={`grid size-10 shrink-0 place-items-center border ${r.locked ? "border-line text-mist" : "border-gold/50 text-gold"}`}>
                            <Icon name={r.locked ? "lock" : r.kind === "link" ? "arrow" : "file"} width={18} height={18} />
                          </span>
                          <span className="min-w-0">
                            <span className={`block text-sm ${r.locked ? "text-mist" : "text-bone"}`}>{r.title}</span>
                            {r.description && <span className="mt-0.5 line-clamp-2 block text-xs text-mist">{r.description}</span>}
                            <span className="mt-1 block text-[0.65rem] tracking-[0.12em] text-mist/80 uppercase">{r.locked ? "Réservé aux inscrits" : meta}</span>
                          </span>
                        </>
                      );
                      const className = "flex h-full items-start gap-3 border border-line bg-ink-2 p-4";
                      if (r.locked) return <li key={r.id} className={`${className} opacity-70`}>{body}</li>;
                      const href = r.kind === "link" ? r.url! : `/mon-espace/ressources/${r.id}`;
                      return (
                        <li key={r.id}>
                          <a href={href} target="_blank" rel="noreferrer" className={`${className} transition-colors hover:border-gold`}>{body}</a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {referral && (
        <section id="parrainage" className="scroll-mt-32 border-t border-line py-16">
          <div className="container-site">
            <h2 className="mb-8 font-display text-2xl tracking-wide uppercase">Parrainez vos amis</h2>
            <ReferralPanel referral={referral} link={`${origin}/r/${referral.code}`} />
          </div>
        </section>
      )}

      {online && (
        <section id="messages" className="scroll-mt-32 border-t border-line pb-20 pt-16">
          <div className="container-site">
            <div className="mb-6">
              <h2 className="font-display text-2xl tracking-wide uppercase">Mes messages</h2>
              <p className="mt-2 text-sm text-mist">
                Une question sur une formation, une date ou un paiement ? L&apos;équipe vous répond ici, en général dans la journée.
              </p>
            </div>
            <div className="flex h-[min(560px,75dvh)] flex-col border border-line bg-ink-2">
              <ChatThread
                load={getMyThreadAction}
                send={sendMyMessageAction}
                viewer="client"
                className="flex-1"
                placeholder="Écrivez votre message…"
                empty="Aucun message pour l'instant. Écrivez-nous, nous vous répondrons ici."
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
