import Link from "next/link";
import { disciplineList } from "@/lib/disciplines";
import { mainNav, site } from "@/lib/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2">
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
          <li>
            <a href={site.phone.href} className="flex items-center gap-3 hover:text-bone">
              <Icon name="phone" width={16} height={16} className="text-gold" /> {site.phone.label}
            </a>
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
        </FooterColumn>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Tous droits réservés.</p>
          <p>Partenaire emploi : {site.partner}</p>
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
