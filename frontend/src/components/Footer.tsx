import Link from "next/link";
import { disciplineList } from "@/lib/disciplines";
import { mainNav, site } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/server";
import { brandIdentity, getPublishedFormations, getSiteSettings } from "@/lib/settings";
import { localizeFormation } from "@/lib/formation-i18n";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export async function Footer() {
  const [settings, formations, { locale, t }] = await Promise.all([getSiteSettings(), getPublishedFormations(), getDictionary()]);
  const phone = typeof settings.phone === "string" ? settings.phone : site.phone.label;
  const phone2 = typeof settings.phone2 === "string" ? settings.phone2 : site.phone2.label;
  const email = typeof settings.email === "string" ? settings.email : site.email.label;
  const facebook = typeof settings.facebook === "string" ? settings.facebook : site.facebook.href;
  const instagram = typeof settings.instagram === "string" ? settings.instagram : site.instagram.href;
  const address = typeof settings.address === "string" ? settings.address : site.address.lines.join(", ");
  const approval = typeof settings.approval === "string" ? settings.approval : site.approval;
  const { brandName, brandDescriptor, siteName, logoUrl } = brandIdentity(settings);
  // Les textes personnalisés dans l'admin sont en français : dans les autres langues, on affiche la traduction.
  const certificationLabel = locale === "fr" && typeof settings.certificationLabel === "string" && settings.certificationLabel ? settings.certificationLabel : t.common.certified;
  const tagline = locale === "fr" && typeof settings.footerTagline === "string" && settings.footerTagline ? settings.footerTagline : t.brand.tagline;

  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <Logo logoUrl={logoUrl} brandName={brandName} brandDescriptor={brandDescriptor} />
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            {tagline}.
          </p>
          <ul className="space-y-1.5 text-xs text-mist">
            {site.branches.map((branch) => (
              <li key={branch.name} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" /> {branch.name}
              </li>
            ))}
          </ul>
          <p className="inline-flex items-center gap-2 border border-line px-3 py-1.5 text-xs tracking-widest text-mist uppercase">
            <Icon name="shield" width={14} height={14} className="text-gold" />
            {certificationLabel} · {approval}
          </p>
        </div>

        <FooterColumn title={t.common.navigation}>
          {mainNav.map((item) => (
            <FooterLink key={item.href} href={item.href}>
              {t.nav[item.key]}
            </FooterLink>
          ))}
          <FooterLink href="/#a-propos">{t.nav.about}</FooterLink>
          <FooterLink href="/#temoignages">{t.nav.testimonials}</FooterLink>
          <FooterLink href="/#faq">{t.nav.faq}</FooterLink>
        </FooterColumn>

        <FooterColumn title={t.common.formations}>
          {(formations.length > 0 ? formations : disciplineList).map((formation) => localizeFormation(formation, locale)).map((formation) => (
            <FooterLink key={formation.slug} href={`/formations/${formation.slug}`}>
              {formation.name}
            </FooterLink>
          ))}
          <FooterLink href="/formations">{t.common.allFormations}</FooterLink>
          <FooterLink href="/planning">{t.common.planningLink}</FooterLink>
        </FooterColumn>

        <FooterColumn title={t.common.contact}>
          <li className="overflow-hidden border border-line bg-ink">
            <iframe
              src={site.address.embedHref}
              title={t.common.mapTitle}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-40 w-full"
            />
            <div className="flex items-center justify-between gap-3 p-3">
              <span className="flex min-w-0 items-start gap-2 text-xs leading-relaxed text-mist">
                <Icon name="pin" width={15} height={15} className="mt-0.5 shrink-0 text-gold" />
                <span>{address}</span>
              </span>
              <a
                href={site.address.href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 border border-line px-3 py-2 font-display text-xs uppercase text-bone transition-colors hover:border-gold hover:text-gold"
              >
                {t.common.directions}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Icon name="phone" width={16} height={16} className="mt-0.5 shrink-0 text-gold" />
            <span>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="block hover:text-bone">{phone}</a>
              <a href={`tel:${phone2.replace(/\s/g, "")}`} className="block hover:text-bone">{phone2}</a>
            </span>
          </li>
          <li>
            <a href={`mailto:${email}`} className="flex items-center gap-3 break-all hover:text-bone">
              <Icon name="mail" width={16} height={16} className="shrink-0 text-gold" /> {email}
            </a>
          </li>
          <li>
            <a href={facebook} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-bone">
              <Icon name="facebook" width={16} height={16} className="text-gold" /> {site.facebook.label}
            </a>
          </li>
          <li>
            <a href={site.messenger.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-bone">
              <Icon name="chat" width={16} height={16} className="text-gold" /> {site.messenger.label}
            </a>
          </li>
          <li>
            <a href={instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-bone">
              <Icon name="instagram" width={16} height={16} className="text-gold" /> {site.instagram.label}
            </a>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteName}. {t.common.allRights}</p>
          <nav aria-label={t.common.legalNav} className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/mentions-legales" className="hover:text-bone">{t.common.legal}</Link>
            <Link href="/politique-de-confidentialite" className="hover:text-bone">{t.common.privacy}</Link>
            <Link href="/cookies" className="hover:text-bone">{t.common.cookies}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow mb-5">{title}</h2>
      <ul className="space-y-3 text-sm text-mist">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition-colors hover:text-bone">
        {children}
      </Link>
    </li>
  );
}
