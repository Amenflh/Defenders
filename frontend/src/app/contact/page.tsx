import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { DISCIPLINE_SLUGS, type DisciplineSlug } from "@/lib/disciplines";
import { brand } from "@/lib/images";
import { site } from "@/lib/site";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact & inscription",
  description: "Demandez votre inscription à une formation Pilates, football ou personal training.",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { formation } = await searchParams;
  const preselected = DISCIPLINE_SLUGS.includes(formation as DisciplineSlug) ? (formation as DisciplineSlug) : undefined;

  const contacts = [
    { icon: "pin" as const, label: "Adresse", value: site.address.lines.join(", "), href: site.address.href, external: true },
    { icon: "phone" as const, label: "Téléphone", value: site.phone.label, href: site.phone.href },
    { icon: "phone" as const, label: "Téléphone 2", value: site.phone2.label, href: site.phone2.href },
    { icon: "mail" as const, label: "E-mail", value: site.email.label, href: site.email.href },
    { icon: "facebook" as const, label: "Facebook", value: site.facebook.label, href: site.facebook.href, external: true },
    { icon: "instagram" as const, label: "Instagram", value: site.instagram.label, href: site.instagram.href, external: true },
  ];

  return (
    <>
      <PageIntro eyebrow="Contact" title="Rejoignez la prochaine promotion">
        Coach professionnel ou jeune diplômé, dites-nous qui vous êtes et quelle formation vous intéresse : nous vous
        recontactons pour vous orienter et vous communiquer les prochaines dates.
      </PageIntro>

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <ContactForm preselected={preselected} />

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-ink-2 p-7">
              <h2 className="eyebrow mb-6">Nous joindre</h2>
              <ul className="space-y-5">
                {contacts.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="group flex items-start gap-4"
                    >
                      <span className="grid size-10 shrink-0 place-items-center border border-line text-gold transition-colors group-hover:border-gold">
                        <Icon name={c.icon} width={18} height={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs tracking-[0.18em] text-mist uppercase">{c.label}</span>
                        <span className="block break-words group-hover:text-gold">{c.value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden border border-line">
              <Image src={brand.info} alt={`${site.group} : Defenders Security Protection, A.K Tunisian Security Academy, Defenders Fitness Academy`} sizes="352px" className="w-full" />
            </div>

            <p className="flex items-center gap-2 text-xs tracking-widest text-mist uppercase">
              <Icon name="shield" width={14} height={14} className="text-gold" /> {site.approval}
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
