import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales relatives au site Defenders Fitness Academy.",
};

export default function LegalPage() {
  return (
    <>
      <PageIntro eyebrow="Informations légales" title="Mentions légales" />
      <section className="py-16 lg:py-20">
        <article className="container-site max-w-4xl space-y-8 text-sm leading-7 text-mist">
          <LegalSection title="Éditeur du site">
            <p>{site.name}<br />{site.address.lines.join(" — ")}</p>
          </LegalSection>
          <LegalSection title="Contact">
            <p><a href={site.phone.href} className="text-bone hover:text-gold">{site.phone.label}</a><br />
              <a href={site.email.href} className="text-bone hover:text-gold">{site.email.label}</a></p>
          </LegalSection>
          <LegalSection title="Activité">
            <p>Centre de formation certifié. {site.approval}. Les contenus pédagogiques et les prochaines sessions doivent être confirmés directement auprès de l&apos;académie.</p>
          </LegalSection>
          <LegalSection title="Propriété intellectuelle">
            <p>Les textes, photographies, vidéos, marques et éléments graphiques présents sur ce site sont protégés. Toute reproduction ou exploitation non autorisée est interdite.</p>
          </LegalSection>
          <LegalSection title="Responsabilité">
            <p>Les informations du site sont fournies à titre informatif. L&apos;académie peut les modifier ou les actualiser sans préavis. Les horaires et tarifs exacts sont confirmés auprès de l&apos;équipe.</p>
          </LegalSection>
        </article>
      </section>
    </>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl uppercase text-bone">{title}</h2>
      {children}
    </section>
  );
}
