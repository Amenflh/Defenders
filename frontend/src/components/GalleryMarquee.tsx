import Image from "next/image";
import type { DynamicPhoto } from "@/lib/disciplines";

type Props = {
  photos: DynamicPhoto[];
  label: string;
  /** Durée d'un tour complet, en secondes. */
  duration?: number;
};

/**
 * Galerie défilante (même principe que le bandeau de l'accueil) acceptant aussi les images du CMS (URL).
 * La série est répétée pour remplir l'écran, puis dupliquée pour une boucle sans couture (-50 %).
 */
export function GalleryMarquee({ photos, label, duration }: Props) {
  if (photos.length === 0) return null;
  const repeat = Math.max(1, Math.ceil(6 / photos.length));
  const base = Array.from({ length: repeat }, () => photos).flat();
  const loop = [...base, ...base];
  const seconds = duration ?? Math.max(30, base.length * 7);

  return (
    <div
      dir="ltr"
      role="region"
      aria-label={label}
      className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
    >
      <ul
        className="marquee-track flex w-max gap-4 animate-marquee"
        style={{ "--marquee-duration": `${seconds}s` } as React.CSSProperties}
      >
        {loop.map((photo, i) => {
          const duplicate = i >= photos.length;
          const remote = typeof photo.src === "string";
          const ratio = typeof photo.src === "string" ? "4 / 5" : `${photo.src.width} / ${photo.src.height}`;
          return (
            <li
              key={i}
              aria-hidden={duplicate || undefined}
              className="group relative h-64 shrink-0 overflow-hidden bg-ink-3 sm:h-80 lg:h-[26rem]"
              style={{ aspectRatio: ratio }}
            >
              <Image
                src={photo.src}
                alt={duplicate ? "" : photo.alt}
                fill
                // Les images entrent à l'écran par animation : en « lazy », elles resteraient vides.
                loading="eager"
                placeholder={remote ? "empty" : "blur"}
                unoptimized={remote}
                sizes="(min-width: 1024px) 40vw, 70vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
