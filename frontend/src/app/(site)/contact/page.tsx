import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { brand } from "@/lib/images";
import { trainingOptions } from "@/lib/formations";
import { cookies } from "next/headers";
import { REFERRAL_CODE, REFERRAL_COOKIE } from "@/lib/program";
import { apiFetch, getContactDefaults } from "@/lib/session";
import { site } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/server";
import { localizeFormation } from "@/lib/formation-i18n";
import { ContactForm, type ContactDefaults } from "./ContactForm";
import { ContactPopup } from "./ContactPopup";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.contact.title, description: t.contact.intro };
}

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const params = await searchParams;
  const { locale, t } = await getDictionary();
  const L = t.contact.labels;
  const formation = typeof params.formation === "string" ? params.formation : undefined;
  const popup = typeof params.popup === "string" ? params.popup : undefined;
  const formationsRes = await apiFetch("/api/formations");
  const formations = formationsRes.ok
    ? ((await formationsRes.json()) as { formations: { slug: string; name: string; accent?: string }[] }).formations
    : [];
  const availableTrainings = formations.length ? trainingOptions(formations.map((f) => localizeFormation(f, locale))) : undefined;
  const preselected = formations.some((item) => item.slug === formation) ? formation : undefined;
  const popupMode = popup === "1";

  // Client connecté : coordonnées pré-remplies depuis son compte.
  const defaults: ContactDefaults = await getContactDefaults();

  // Ami invité par un lien /r/CODE : mot d'accueil avec le prénom du parrain.
  const referralCode = (await cookies()).get(REFERRAL_COOKIE)?.value;
  const referrer = referralCode && REFERRAL_CODE.test(referralCode)
    ? await apiFetch(`/api/referrals/${encodeURIComponent(referralCode)}`)
        .then(async (r) => (r.ok ? ((await r.json()) as { firstName: string }).firstName : null))
        .catch(() => null)
    : null;

  const contacts = [
    { icon: "pin" as const, label: L.address, value: site.address.lines.join(", "), href: site.address.href, external: true },
    { icon: "phone" as const, label: L.phone, value: site.phone.label, href: site.phone.href },
    { icon: "phone" as const, label: L.phone2, value: site.phone2.label, href: site.phone2.href },
    { icon: "mail" as const, label: L.email, value: site.email.label, href: site.email.href },
    { icon: "phone" as const, label: L.whatsapp, value: site.phone2.label, href: site.whatsapp.href, external: true },
    { icon: "chat" as const, label: L.messenger, value: site.facebook.label, href: site.messenger.href, external: true },
    { icon: "mail" as const, label: L.securityEmail, value: site.securityEmail.label, href: site.securityEmail.href },
    { icon: "facebook" as const, label: L.facebook, value: site.facebook.label, href: site.facebook.href, external: true },
    { icon: "instagram" as const, label: L.instagram, value: site.instagram.label, href: site.instagram.href, external: true },
  ];

  return (
    <>
      <PageIntro eyebrow={t.contact.eyebrow} title={t.contact.title}>
        {t.contact.intro}
      </PageIntro>

      {popupMode && <ContactPopup preselected={preselected} defaults={defaults} availableTrainings={availableTrainings} />}

      {referrer && (
        <div className="container-site pt-10">
          <p role="status" className="flex items-center gap-3 border border-gold/50 bg-gold/10 px-5 py-4 text-sm text-bone">
            <Icon name="star" width={18} height={18} className="shrink-0 text-gold" />
            <span>{t.contact.referral(referrer)}</span>
          </p>
        </div>
      )}

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <ContactForm preselected={preselected} defaults={defaults} availableTrainings={availableTrainings} />

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-ink-2 p-7">
              <h2 className="eyebrow mb-6">{t.contact.reachUs}</h2>
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
