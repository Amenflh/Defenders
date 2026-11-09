import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatThread } from "@/components/chat/ChatThread";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { STATUS_CLIENT_LABELS, TRAINING_LABELS, dateFmt } from "@/lib/labels";
import { apiFetch, getCurrentUser } from "@/lib/session";
import { getMyThreadAction, sendMyMessageAction } from "../chat-actions";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };

type Inscription = { id: string; createdAt: string; trainings: string[]; status: string; availability: string };

export default async function MonEspacePage() {
  const user = await getCurrentUser();
  if (user === null) redirect("/login?next=/mon-espace");
  if (user !== "unavailable" && user.role === "admin") redirect("/admin");

  const res = user === "unavailable" ? null : await apiFetch("/api/me/inscriptions").catch(() => null);
  const inscriptions = res?.ok ? ((await res.json()) as { inscriptions: Inscription[] }).inscriptions : null;
  const firstName = user === "unavailable" ? "" : user.name.split(" ")[0];

  return (
    <>
      <PageIntro eyebrow="Mon espace" title={firstName ? `Bonjour ${firstName}` : "Mon espace"}>
        Suivez ici l&apos;état de vos demandes d&apos;inscription et échangez directement avec l&apos;équipe Defenders Fitness Academy.
      </PageIntro>

      <section className="py-16">
        <div className="container-site">
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
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {user !== "unavailable" && (
        <section id="messages" className="scroll-mt-24 border-t border-line pb-20 pt-16">
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
