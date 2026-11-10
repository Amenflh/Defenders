import type { Metadata } from "next";
import { FormationHighlights, FormationHistoryLink } from "@/components/FormationExtras";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: "Defenders Security Protection", description: t.pages.security.metaDescription };
}

export default async function SecurityPage() {
  const { t } = await getDictionary();
  const S = t.pages.security;
  return (
    <>
      <PageIntro
        eyebrow="Defenders Security Protection"
        title={S.title}
      >
        {S.intro}
      </PageIntro>

      <FormationHighlights slug="securite" />

      <section className="py-20 lg:py-28">
        <div className="container-site">
          <Reveal className="mb-12 max-w-3xl">
            <p className="eyebrow mb-3">{S.servicesEyebrow}</p>
            <h2 className="heading-lg">{S.servicesTitle}</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {S.services.map((service, index) => (
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
            <p className="eyebrow mb-3">{S.programmeEyebrow}</p>
            <h2 className="heading-lg">{S.programmeTitle}</h2>
            <p className="mt-5 max-w-xl text-mist">{S.programmeText}</p>
            <a
              href="https://acrobat.adobe.com/id/urn:aaid:sc:EU:42ab2b8c-bc1a-4c97-8286-b7da59f35486"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-7"
            >
              {S.download} <Icon name="arrow" className="rtl:-scale-x-100" />
            </a>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-line bg-ink p-7 sm:p-8">
              <h3 className="font-display text-2xl uppercase text-bone">{S.infoTitle}</h3>
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
            <p className="eyebrow mb-3">{S.addressEyebrow}</p>
            <h2 className="heading-lg">{S.addressTitle}</h2>
            <p className="mt-5 text-mist">{S.address}</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Rond-point+Le+Sultan+Avenue+Abou+Dhabi+Hammamet+Tunisie"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-7"
            >
              <Icon name="pin" /> {S.directions}
            </a>
          </Reveal>
          <Reveal delay={120} className="overflow-hidden border border-line bg-ink-2">
            <iframe
              src="https://maps.google.com/maps?q=Rond-point%20Le%20Sultan%20Hammamet%20Tunisie&output=embed"
              title={S.mapTitle}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[320px] w-full"
            />
          </Reveal>
        </div>
      </section>

      <FormationHistoryLink slug="securite" />
    </>
  );
}
