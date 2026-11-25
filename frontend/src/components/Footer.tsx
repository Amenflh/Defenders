import Link from "next/link";
import { formationHref, type Academy } from "@/lib/academies";
import { mainNav, site } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/server";
import { brandIdentity, getContacts, getPublishedFormations, getSiteSettings } from "@/lib/settings";
import { localizeFormation, type Translations } from "@/lib/formation-i18n";
import { academyFooterVariants } from "@/lib/academy-footer";
import { AcademyFooterBrand, AcademyFooterContact } from "./AcademyFooter";
import { FooterWordmark } from "./FooterWordmark";

export async function Footer() {
  const [settings, formations, { locale, t }, contacts] = await Promise.all([
    getSiteSettings(),
    getPublishedFormations<{ slug: string; name: string; academy: Academy; translations?: Translations }>(),
    getDictionary(),
    getContacts(),
  ]);
  const { brandName, brandDescriptor, siteName, logoUrl } = brandIdentity(settings);
  // Les textes personnalisés dans l'admin sont en français : dans les autres langues, on affiche la traduction.
  const certificationLabel = locale === "fr" && typeof settings.certificationLabel === "string" && settings.certificationLabel ? settings.certificationLabel : t.common.certified;
  const tagline = locale === "fr" && typeof settings.footerTagline === "string" && settings.footerTagline ? settings.footerTagline : t.brand.tagline;
  const academyVariants = academyFooterVariants(contacts, {
    fitness: t.pages.fitnessAcademy.metaDescription,
    tsa: t.pages.akAcademy.metaDescription,
    tsaFacebook: t.pages.akAcademy.profile,
  });

  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <AcademyFooterBrand
          identity={{ logoUrl, brandName, brandDescriptor }}
          tagline={tagline}
          branches={site.branches}
          certificationLabel={certificationLabel}
          approval={contacts.approval}
          comingSoonLabel={t.branches.comingSoon.title}
          variants={academyVariants}
        />

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
          {formations.map((formation) => localizeFormation(formation, locale)).map((formation) => (
            <FooterLink key={formation.slug} href={formationHref(formation)}>
              {formation.name}
            </FooterLink>
          ))}
          <FooterLink href="/formations">{t.common.allFormations}</FooterLink>
          <FooterLink href="/planning">{t.common.planningLink}</FooterLink>
        </FooterColumn>

        <AcademyFooterContact
          address={contacts.address.lines.join(", ")}
          addressHref={contacts.address.href}
          phone={contacts.phone.label}
          phone2={contacts.phone2.label}
          email={contacts.email.label}
          facebook={contacts.facebook.href}
          instagram={contacts.instagram.href}
          directionsLabel={t.common.directions}
          contactLabel={t.common.contact}
          messengerHref={contacts.messenger.href}
          messengerLabel={contacts.messenger.label}
          facebookLabel={contacts.facebook.label}
          instagramLabel={contacts.instagram.label}
          variants={academyVariants}
        />
      </div>

      {/* Signature : le nom de la marque en très grand, qui clôt chaque page. */}
      <div aria-hidden="true" className="footer-wordmark container-site select-none overflow-hidden">
        <FooterWordmark text={brandName} />
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteName}. {t.common.allRights}</p>
          <nav aria-label={t.common.legalNav} className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/mentions-legales" className="hover:text-bone">{t.common.legal}</Link>
            <Link href="/politique-de-confidentialite" className="hover:text-bone">{t.common.privacy}</Link>
            <Link href="/cookies" className="hover:text-bone">{t.common.cookies}</Link>
            <Link href="/reglement-interieur" className="hover:text-bone">{t.common.rules}</Link>
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
