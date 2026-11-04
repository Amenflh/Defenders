import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Informations sur l'utilisation éventuelle des cookies sur le site Defenders Fitness Academy.",
};

export default function CookiesPage() {
  return (
    <>
      <PageIntro eyebrow="Informations légales" title="Cookies" />
      <section className="py-16 lg:py-20">
        <article className="container-site max-w-4xl space-y-8 text-sm leading-7 text-mist">
          <section>
            <h2 className="mb-3 font-display text-xl uppercase text-bone">Cookies strictement nécessaires</h2>
            <p>À ce jour, le site ne présente pas de bandeau publicitaire ni de traçage marketing. Le fonctionnement technique peut utiliser des mécanismes essentiels au chargement des pages.</p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl uppercase text-bone">Services tiers</h2>
            <p>La carte intégrée et les liens vers les réseaux sociaux peuvent être soumis aux politiques de confidentialité de leurs propres fournisseurs. Ces services peuvent lire des informations techniques lorsqu&apos;ils sont utilisés.</p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl uppercase text-bone">Gestion du navigateur</h2>
            <p>Vous pouvez supprimer ou bloquer les cookies depuis les paramètres de votre navigateur. Certaines fonctionnalités externes peuvent alors ne plus fonctionner normalement.</p>
            <Link href="/politique-de-confidentialite" className="mt-5 inline-flex text-gold hover:text-bone">
              Consulter la politique de confidentialité
            </Link>
          </section>
        </article>
      </section>
    </>
  );
}
