import Link from "next/link";
import { disciplineList } from "@/lib/disciplines";
import { mainNav, site } from "@/lib/site";
import { getPublishedFormations, getSiteSettings } from "@/lib/settings";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export async function Footer() {
  const [settings, formations] = await Promise.all([getSiteSettings(), getPublishedFormations()]);
  const phone = typeof settings.phone === "string" ? settings.phone : site.phone.label;
  const phone2 = typeof settings.phone2 === "string" ? settings.phone2 : site.phone2.label;
  const email = typeof settings.email === "string" ? settings.email : site.email.label;
  const facebook = typeof settings.facebook === "string" ? settings.facebook : site.facebook.href;
  const instagram = typeof settings.instagram === "string" ? settings.instagram : site.instagram.href;
  const address = typeof settings.address === "string" ? settings.address : site.address.lines.join(", ");
  const approval = typeof settings.approval === "string" ? settings.approval : site.approval;
  const brandName = typeof settings.brandName === "string" && settings.brandName ? settings.brandName : site.shortName;
  const brandDescriptor = typeof settings.brandDescriptor === "string" && settings.brandDescriptor ? settings.brandDescriptor : "Fitness Academy";
  const siteName = `${brandName} ${brandDescriptor}`.trim();
  const logoUrl = typeof settings.logoUrl === "string" && settings.logoUrl ? settings.logoUrl : undefined;
  const certificationLabel = typeof settings.certificationLabel === "string" && settings.certificationLabel ? settings.certificationLabel : "Centre certifié";

  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <Logo logoUrl={logoUrl} brandName={brandName} brandDescriptor={brandDescriptor} />
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            {typeof settings.footerTagline === "string" ? settings.footerTagline : site.tagline}. Membre de {typeof settings.footerGroup === "string" ? settings.footerGroup : site.group}.
          </p>
          <p className="inline-flex items-center gap-2 border border-line px-3 py-1.5 text-xs tracking-widest text-mist uppercase">
            <Icon name="shield" width={14} height={14} className="text-gold" />
            {certificationLabel} · {approval}
          </p>
        </div>

        <FooterColumn title="Navigation">
          {mainNav.map((item) => (
            <FooterLink key={item.href} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
          <FooterLink href="/#a-propos">À propos</FooterLink>
          <FooterLink href="/#temoignages">Témoignages</FooterLink>
          <FooterLink href="/#faq">FAQ</FooterLink>
        </FooterColumn>

        <FooterColumn title="Formations">
          {(formations.length > 0 ? formations : disciplineList).map((formation) => (
            <FooterLink key={formation.slug} href={`/formations/${formation.slug}`}>
              {formation.name}
            </FooterLink>
          ))}
          <FooterLink href="/formations">Toutes les formations</FooterLink>
          <FooterLink href="/planning">Planning des sessions</FooterLink>
        </FooterColumn>

        <FooterColumn title="Contact">
          <li className="overflow-hidden border border-line bg-ink">
            <iframe
              src={site.address.embedHref}
              title="Carte de Defenders Fitness Academy à Hammamet"
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
                Itinéraire
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
            <a href={instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-bone">
              <Icon name="instagram" width={16} height={16} className="text-gold" /> {site.instagram.label}
            </a>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteName}. Tous droits réservés.</p>
          <nav aria-label="Informations légales" className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/mentions-legales" className="hover:text-bone">Mentions légales</Link>
            <Link href="/politique-de-confidentialite" className="hover:text-bone">Politique de confidentialité</Link>
            <Link href="/cookies" className="hover:text-bone">Cookies</Link>
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
