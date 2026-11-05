import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Defenders Security Protection",
  description:
    "Formations, gardiennage, protection rapprochée, intervention incendie et secourisme avec Defenders Security Protection.",
};

const services = [
  {
    title: "Sécurité renforcée",
    text: "Interventions face aux incidents terroristes et criminels, avec des procédures adaptées et des équipes qualifiées.",
  },
  {
    title: "Personnel qualifié",
    text: "Agents formés aux premières interventions en cas d'incendie, à l'évacuation et au secourisme.",
  },
  {
    title: "Gardiennage",
    text: "Surveillance, contrôle d'accès, rondes et sécurisation des sites selon les besoins du client.",
  },
  {
    title: "Protection rapprochée",
    text: "Accompagnement sécurisé, analyse des risques et mise en place de dispositifs de protection personnalisés.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <PageIntro
        eyebrow="Defenders Security Protection"
        title="Sécurité, protection & formation professionnelle"
      >
        Une offre dédiée aux besoins de sécurité, au gardiennage, aux premières interventions et à la formation des professionnels.
      </PageIntro>

      <section className="py-20 lg:py-28">
        <div className="container-site">
          <Reveal className="mb-12 max-w-3xl">
            <p className="eyebrow mb-3">Nos services</p>
            <h2 className="heading-lg">Une réponse professionnelle à chaque situation</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={index * 80}>
                <article className="h-full border border-line bg-ink-2 p-7 sm:p-8">
                  <Icon name="shield" width={28} height={28} className="text-gold" />
                  <h3 className="mt-6 font-display text-2xl uppercase text-bone">{service.title}</h3>
                  <p className="mt-3 leading-relaxed text-mist">{service.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-2 py-20 lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <Reveal>
            <p className="eyebrow mb-3">Programme de formation</p>
            <h2 className="heading-lg">Consultez notre programme</h2>
            <p className="mt-5 max-w-xl text-mist">
              Téléchargez le programme officiel pour découvrir les spécialités, les contenus et les informations pratiques disponibles.
            </p>
            <a
              href="https://acrobat.adobe.com/id/urn:aaid:sc:EU:42ab2b8c-bc1a-4c97-8286-b7da59f35486"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-7"
            >
              Télécharger le programme <Icon name="arrow" />
            </a>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-line bg-ink p-7 sm:p-8">
              <h3 className="font-display text-2xl uppercase text-bone">Demander des informations</h3>
              <div className="mt-6 space-y-5">
                <a href={site.phone2.href} className="flex items-center gap-4 text-mist hover:text-bone">
                  <Icon name="phone" className="text-gold" />
                  {site.phone2.label}
                </a>
                <a href={site.phone.href} className="flex items-center gap-4 text-mist hover:text-bone">
                  <Icon name="phone" className="text-gold" />
                  {site.phone.label}
                </a>
                <a href={site.whatsapp.href} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-mist hover:text-bone">
                  <Icon name="phone" className="text-gold" />
                  WhatsApp · {site.phone2.label}
                </a>
                <a href={site.securityEmail.href} className="flex items-center gap-4 break-all text-mist hover:text-bone">
                  <Icon name="mail" className="text-gold" />
                  {site.securityEmail.label}
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                {site.securityFacebook.map((profile) => (
                  <a key={profile.href} href={profile.href} target="_blank" rel="noreferrer" className="btn btn-ghost !px-4">
                    <Icon name="facebook" /> Facebook
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="eyebrow mb-3">Adresse</p>
            <h2 className="heading-lg">Rond-point Le Sultan</h2>
            <p className="mt-5 text-mist">Avenue Abou Dhabi, Hammamet Nord, Tunisie</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Rond-point+Le+Sultan+Avenue+Abou+Dhabi+Hammamet+Tunisie"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-7"
            >
              <Icon name="pin" /> Voir l&apos;itinéraire
            </a>
          </Reveal>
          <Reveal delay={120} className="overflow-hidden border border-line bg-ink-2">
            <iframe
              src="https://maps.google.com/maps?q=Rond-point%20Le%20Sultan%20Hammamet%20Tunisie&output=embed"
              title="Localisation Defenders Security Protection"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[320px] w-full"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
