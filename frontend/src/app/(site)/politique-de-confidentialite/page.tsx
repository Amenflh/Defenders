import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { site } from "@/lib/site";
import { apiFetch } from "@/lib/session";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Informations sur la collecte et l'utilisation des données transmises à Defenders Fitness Academy.",
};

export default async function PrivacyPage() {
  const res = await apiFetch("/api/content/settings/site");
  const settings = res.ok ? ((await res.json()) as { value: Record<string, unknown> }).value : {};
  const text = typeof settings.privacy === "string" && settings.privacy ? settings.privacy : "";
  return (
    <>
      <PageIntro eyebrow="Informations légales" title="Politique de confidentialité">
        Cette page explique quelles informations peuvent être collectées lors de l&apos;utilisation du site.
      </PageIntro>
      <section className="py-16 lg:py-20">
        <article className="container-site max-w-4xl space-y-8 text-sm leading-7 text-mist">
          {text ? <p className="whitespace-pre-line">{text}</p> : (
            <>
          <Section title="Responsable du traitement">
            <p>{site.name} peut collecter les informations envoyées volontairement depuis le formulaire de contact ou d&apos;inscription.</p>
          </Section>
          <Section title="Données collectées">
            <p>Le formulaire peut collecter le prénom, le nom, l&apos;e-mail, le téléphone, la ville, le profil, les formations souhaitées, la disponibilité, le message et une éventuelle pièce jointe.</p>
          </Section>
          <Section title="Finalités">
            <p>Ces données sont utilisées pour répondre à une demande, fournir des informations sur les formations, organiser le suivi des inscriptions et transmettre les informations demandées.</p>
          </Section>
          <Section title="Base juridique et conservation">
            <p>Les données sont traitées sur la base du consentement et de la relation de demande d&apos;information. Elles ne sont conservées que pendant la durée nécessaire au traitement et au suivi de la demande.</p>
          </Section>
          <Section title="Destinataires">
            <p>Les informations peuvent être consultées par les personnes habilitées de l&apos;académie et transmises par e-mail aux destinataires internes responsables du suivi.</p>
          </Section>
          <Section title="Sécurité">
            <p>Des mesures techniques limitent les accès et protègent les transmissions. Une pièce jointe doit respecter les formats PDF, JPG/JPEG ou PNG et la limite annoncée par le formulaire.</p>
          </Section>
          <Section title="Vos droits">
            <p>Vous pouvez demander l&apos;accès, la rectification ou la suppression des données vous concernant en écrivant à <a href={site.email.href} className="text-gold hover:text-bone">{site.email.label}</a>.</p>
          </Section>
            </>
          )}
        </article>
      </section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl uppercase text-bone">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
