import Image from "next/image";
import type { Photo } from "@/lib/images";

type Props = {
  photos: Photo[];
  /** Durée d'un tour complet, en secondes. */
  duration?: number;
  reverse?: boolean;
  height?: "md" | "lg";
};

/**
 * Bandeau d'images concaténées qui défile en continu.
 * La liste est dupliquée pour obtenir une boucle sans couture (translation de -50 %).
 */
export function BannerMarquee({ photos, duration = 70, reverse = false, height = "lg" }: Props) {
  const h = height === "lg" ? "h-64 sm:h-80 lg:h-[26rem]" : "h-48 sm:h-60";

  return (
    <div
      className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
      role="region"
      aria-label="Galerie de nos promotions"
    >
      <ul
        className={`marquee-track flex w-max gap-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {[...photos, ...photos].map((photo, i) => {
          const duplicate = i >= photos.length;
          return (
            <li
              key={i}
              aria-hidden={duplicate || undefined}
              className={`group relative shrink-0 overflow-hidden bg-ink-3 ${h}`}
              style={{ aspectRatio: `${photo.src.width} / ${photo.src.height}` }}
            >
              <Image
                src={photo.src}
                alt={duplicate ? "" : photo.alt}
                // Les images entrent dans l'écran par animation (et non par défilement) :
                // en « lazy », le navigateur ne les chargerait jamais → cadres vides.
                loading="eager"
                placeholder="blur"
                sizes="(min-width: 1024px) 40vw, 70vw"
                className="h-full w-full object-cover grayscale-[35%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Bandeau de mots-clés défilant (texte). */
export function KeywordTicker({ words, reverse = false }: { words: string[]; reverse?: boolean }) {
  const row = (
    <>
      {words.map((w) => (
        <span key={w} className="flex items-center gap-8 pr-8">
          <span>{w}</span>
          <span className="text-gold" aria-hidden="true">✦</span>
        </span>
      ))}
    </>
  );

  return (
    <div className="overflow-hidden border-y border-line bg-ink-2 py-5" aria-hidden="true">
      <div
        className={`marquee-track flex w-max font-display text-2xl tracking-[0.12em] whitespace-nowrap text-bone/80 uppercase sm:text-3xl ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ "--marquee-duration": "40s" } as React.CSSProperties}
      >
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  );
}
