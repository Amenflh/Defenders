import Link from "next/link";
import { disciplineList } from "@/lib/disciplines";
import { mainNav, site } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/server";
import { brandIdentity, getPublishedFormations, getSiteSettings } from "@/lib/settings";
import { localizeFormation } from "@/lib/formation-i18n";
import { academyFooterVariants } from "@/lib/academy-footer";
import { AcademyFooterBrand, AcademyFooterContact } from "./AcademyFooter";

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
  const academyVariants = academyFooterVariants({
    security: t.pages.security.metaDescription,
    fitness: t.pages.fitnessAcademy.metaDescription,
    tsa: t.pages.akAcademy.metaDescription,
    securityPortal: t.pages.security.portal,
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
          approval={approval}
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
          {(formations.length > 0 ? formations : disciplineList).map((formation) => localizeFormation(formation, locale)).map((formation) => (
            <FooterLink key={formation.slug} href={`/formations/${formation.slug}`}>
              {formation.name}
            </FooterLink>
          ))}
          <FooterLink href="/formations">{t.common.allFormations}</FooterLink>
          <FooterLink href="/planning">{t.common.planningLink}</FooterLink>
        </FooterColumn>

        <AcademyFooterContact
          address={address}
          addressHref={site.address.href}
          phone={phone}
          phone2={phone2}
          email={email}
          facebook={facebook}
          instagram={instagram}
          directionsLabel={t.common.directions}
          contactLabel={t.common.contact}
          messengerHref={site.messenger.href}
          messengerLabel={site.messenger.label}
          facebookLabel={site.facebook.label}
          instagramLabel={site.instagram.label}
          variants={academyVariants}
        />
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
