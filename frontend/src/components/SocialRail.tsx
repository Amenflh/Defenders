import { Icon } from "./Icon";

type SocialLink = { name: "facebook" | "instagram" | "linkedin"; label: string; href: string };

/**
 * Barre verticale de réseaux sociaux collée au bord de la page (bord gauche, droit en arabe).
 * Un lien sans adresse (ex. LinkedIn non renseigné dans l'admin) n'est pas affiché.
 */
export function SocialRail({ label, links }: { label: string; links: SocialLink[] }) {
  const visible = links.filter((link) => link.href);
  if (visible.length === 0) return null;
  return (
    <nav aria-label={label} className="fixed start-0 top-1/2 z-30 hidden -translate-y-1/2 sm:block">
      <ul className="flex flex-col overflow-hidden border border-s-0 border-line bg-ink-2/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-md">
        {visible.map((link) => (
          <li key={link.name} className="border-b border-line last:border-b-0">
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              title={link.label}
              className="grid size-11 place-items-center text-bone transition-colors hover:bg-gold hover:text-ink"
            >
              <Icon name={link.name} width={19} height={19} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
