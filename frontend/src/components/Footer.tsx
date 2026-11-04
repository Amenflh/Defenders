import Link from "next/link";
import Image from "next/image";
import { disciplineList } from "@/lib/disciplines";
import { mainNav, site } from "@/lib/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2">
      <section className="border-b border-line bg-ink py-7" aria-label="Partenaires">
        <div className="container-site flex flex-wrap items-center justify-center gap-4 sm:justify-between sm:gap-6">
          {[
            { name: "RITEJ", href: site.partners.employment[0].href, logo: "/pics/partners/RITEJ.jpg" },
            { name: "Bayrak El Arab", href: site.partners.employment[1].href, logo: "/pics/partners/Bayrak.jpg" },
            { name: "Tunisian Security Academy", href: site.partners.training[0].href, logo: "/pics/partners/Security.jpg" },
            { name: "Sunset Studio Pilates", href: site.partners.training[1].href, logo: "/pics/partners/Sunset.jpg" },
          ].map((partner) => (
            <a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Voir ${partner.name}`}
              className="grid size-[72px] place-items-center overflow-hidden rounded-full border border-white/20 bg-white p-1.5 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_10px_30px_rgba(201,162,39,.25)] sm:size-[84px]"
            >
              <Image src={partner.logo} alt="" width={70} height={70} className="h-full w-full rounded-full object-cover" />
            </a>
          ))}
        </div>
      </section>
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            {site.tagline}. Membre de {site.group}.
          </p>
          <p className="inline-flex items-center gap-2 border border-line px-3 py-1.5 text-xs tracking-widest text-mist uppercase">
            <Icon name="shield" width={14} height={14} className="text-gold" />
            Centre certifié · {site.approval}
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
          {disciplineList.map((d) => (
            <FooterLink key={d.slug} href={`/${d.slug}`}>
              {d.name}
            </FooterLink>
          ))}
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
                <span>{site.address.lines.join(", ")}</span>
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
              <a href={site.phone.href} className="block hover:text-bone">{site.phone.label}</a>
              <a href={site.phone2.href} className="block hover:text-bone">{site.phone2.label}</a>
            </span>
          </li>
          <li>
            <a href={site.email.href} className="flex items-center gap-3 break-all hover:text-bone">
              <Icon name="mail" width={16} height={16} className="shrink-0 text-gold" /> {site.email.label}
            </a>
          </li>
          <li>
            <a href={site.facebook.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-bone">
              <Icon name="facebook" width={16} height={16} className="text-gold" /> {site.facebook.label}
            </a>
          </li>
          <li>
            <a href={site.instagram.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-bone">
              <Icon name="instagram" width={16} height={16} className="text-gold" /> {site.instagram.label}
            </a>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Tous droits réservés.</p>
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
