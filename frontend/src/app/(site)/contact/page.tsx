import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { brand } from "@/lib/images";
import { apiFetch, getCurrentUser } from "@/lib/session";
import { site } from "@/lib/site";
import { ContactForm, type ContactDefaults } from "./ContactForm";
import { ContactPopup } from "./ContactPopup";

export const metadata: Metadata = {
  title: "Contact & inscription",
  description: "Demandez votre inscription à une formation Pilates, football ou personal training.",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const params = await searchParams;
  const formation = typeof params.formation === "string" ? params.formation : undefined;
  const popup = typeof params.popup === "string" ? params.popup : undefined;
  const formationsRes = await apiFetch("/api/formations");
  const formations = formationsRes.ok
    ? ((await formationsRes.json()) as { formations: { slug: string; name: string; accent?: string }[] }).formations
    : [];
  const availableTrainings = formations.length
    ? formations.map((item) => ({
        value: item.slug,
        label: item.name,
        dot: ({ pilates: "bg-pilates", football: "bg-football", personal: "bg-personal" } as Record<string, string>)[item.accent ?? ""] ?? "bg-gold",
      }))
    : undefined;
  const preselected = formations.some((item) => item.slug === formation) ? formation : undefined;
  const popupMode = popup === "1";

  // Client connecté : coordonnées pré-remplies depuis son compte.
  const user = await getCurrentUser();
  let defaults: ContactDefaults = {};
  if (user && user !== "unavailable" && user.role === "client") {
    const [firstName, ...rest] = user.name.trim().split(/\s+/);
    defaults = { firstName, lastName: rest.join(" "), email: user.email, phone: user.phone };
  }

  const contacts = [
    { icon: "pin" as const, label: "Adresse", value: site.address.lines.join(", "), href: site.address.href, external: true },
    { icon: "phone" as const, label: "Téléphone", value: site.phone.label, href: site.phone.href },
    { icon: "phone" as const, label: "Téléphone 2", value: site.phone2.label, href: site.phone2.href },
    { icon: "mail" as const, label: "E-mail", value: site.email.label, href: site.email.href },
    { icon: "phone" as const, label: "WhatsApp", value: site.phone2.label, href: site.whatsapp.href, external: true },
    { icon: "mail" as const, label: "E-mail Security Protection", value: site.securityEmail.label, href: site.securityEmail.href },
    { icon: "facebook" as const, label: "Facebook", value: site.facebook.label, href: site.facebook.href, external: true },
    { icon: "instagram" as const, label: "Instagram", value: site.instagram.label, href: site.instagram.href, external: true },
  ];

  return (
    <>
      <PageIntro eyebrow="Contact" title="Rejoignez la prochaine promotion">
        Coach professionnel ou jeune diplômé, dites-nous qui vous êtes et quelle formation vous intéresse : nous vous
        recontactons pour vous orienter et vous communiquer les prochaines dates.
      </PageIntro>

      {popupMode && <ContactPopup preselected={preselected} defaults={defaults} availableTrainings={availableTrainings} />}

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <ContactForm preselected={preselected} defaults={defaults} availableTrainings={availableTrainings} />

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
