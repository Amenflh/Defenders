import Image from "next/image";
import Link from "next/link";
import { visualFor } from "@/lib/formation-visuals";
import { formatPrice, type Formation } from "@/lib/formations";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { accentClassFor } from "@/lib/formation-visuals";
import { Icon } from "./Icon";

/** Carte d'une formation (accueil, liste des formations). */
export async function FormationCard({ f: source, priority = false }: { f: Formation; priority?: boolean }) {
  const { locale, t } = await getDictionary();
  const f = localizeFormation(source, locale);
  const { accent, cover } = visualFor(f.slug);
  const details = [f.durationLabel, f.levelLabel, formatPrice(f.priceTnd)].filter(Boolean).join(" · ");
  const imageClass = "object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-60";

  return (
    <Link
      href={`/formations/${f.slug}`}
      className={`${accentClassFor(f.slug)} group relative block aspect-[4/5] overflow-hidden bg-ink transition duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(205,180,140,0.16)]`}
    >
      {f.coverUrl ? (
        <Image src={f.coverUrl} alt="" fill unoptimized preload={priority} className={imageClass} />
      ) : (
        <Image src={cover.src} alt="" fill preload={priority} placeholder="blur" sizes="(min-width: 768px) 33vw, 100vw" className={imageClass} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-7 text-bone">
        <span className={`mb-4 block h-1 w-12 ${accent.bg} transition-all duration-500 group-hover:w-24`} />
        <h3 className="font-display text-3xl tracking-wide uppercase">{f.name}</h3>
        {details && <p className={`mt-2 text-xs tracking-[0.14em] uppercase ${accent.text}`}>{details}</p>}
        {f.summary && (
          <p className="mt-3 text-sm leading-relaxed text-bone/80 transition-all duration-500 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
            {f.summary}
          </p>
        )}
        <span className="mt-5 inline-flex items-center gap-2 font-display text-sm tracking-[0.15em] uppercase">
          {t.pages.formation.discover} <Icon name="arrow" className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
        </span>
      </div>
    </Link>
  );
}
