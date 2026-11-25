import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import type { FacebookVideoLayout } from "./FacebookVideoEmbed";
import { Icon } from "./Icon";
import { VideoEmbed } from "./VideoEmbed";

/**
 * Alignement des cartes d'une même rangée (sous-grille) : média, durée, titre, texte et boutons commencent à la
 * même hauteur dans toutes les cartes. `courseGrid` va sur la grille, `courseSlot` sur chaque enfant direct.
 */
export const courseGrid = "grid gap-x-6";
export const courseSlot = "row-span-5 grid grid-rows-subgrid pb-6";

export function AcademyCourseCard({
  title,
  text,
  href,
  action,
  poster,
  videoEmbedUrl,
  videoLayout = "portrait",
  detail,
  external = false,
  accentClassName,
  priority = false,
  posterLayout = "landscape",
  posterAlt = "",
  posterMotion = false,
  extraLink,
}: {
  title: string;
  text: string;
  href: string;
  action: string;
  /** Sans affiche ni vidéo, la carte n'affiche que le texte. */
  poster?: string | StaticImageData;
  videoEmbedUrl?: string;
  videoLayout?: FacebookVideoLayout;
  detail?: string;
  external?: boolean;
  accentClassName?: string;
  priority?: boolean;
  /** « portrait » : affiche verticale montrée en entier (format 72/102), sans recadrage du titre. */
  posterLayout?: "landscape" | "portrait";
  posterAlt?: string;
  posterMotion?: boolean;
  /** Lien secondaire (publication source, programme…), ouvert dans un nouvel onglet. */
  extraLink?: { href: string; label: string };
}) {
  return (
    <article className={`row-span-5 grid grid-rows-subgrid overflow-hidden border border-line bg-ink-2 ${accentClassName ?? ""}`}>
      <div className="flex flex-col">
      <span className="h-1 w-full bg-gold" aria-hidden="true" />
      {videoEmbedUrl ? (
        <div className="flex flex-1 items-center bg-black">
          <VideoEmbed url={videoEmbedUrl} title={title} layout={videoLayout} loading={priority ? "eager" : "lazy"} />
        </div>
      ) : poster === undefined ? null : (
        <div className="relative flex-1 overflow-hidden bg-ink">
          {/* Hauteur minimale de l'affiche ; elle remplit ensuite toute la hauteur de la rangée. */}
          <div aria-hidden="true" className={posterLayout === "portrait" ? "mx-auto aspect-[72/102] w-full max-w-[360px]" : "aspect-video"} />
          {posterLayout === "portrait" && (
            <Image src={poster} alt="" aria-hidden="true" fill unoptimized={typeof poster === "string"} sizes="360px" className="scale-110 object-cover opacity-40 blur-xl" />
          )}
          <Image
            src={poster}
            alt={posterAlt}
            fill
            priority={priority}
            unoptimized={typeof poster === "string"}
            sizes={posterLayout === "portrait" ? "360px" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className={`${posterMotion ? "formation-photo-drift " : ""}${posterLayout === "portrait" ? "object-contain" : "object-cover"}`}
          />
        </div>
      )}
      </div>
      <div className="row-span-4 grid grid-rows-subgrid p-6 sm:p-7">
        {detail && <p className="eyebrow row-start-1 mb-3">{detail}</p>}
        <h3 className="row-start-2 font-display text-xl uppercase text-bone sm:text-2xl">{title}</h3>
        <p className="row-start-3 mt-3 text-sm leading-relaxed text-mist">{text}</p>
        <div className="row-start-4 mt-6 flex flex-wrap content-start gap-3">
          {external ? (
            <a href={href} target="_blank" rel="noreferrer" className="btn btn-primary !px-4 !py-2.5 !text-xs">
              {action} <Icon name="arrow" className="rtl:-scale-x-100" />
            </a>
          ) : (
            <Link href={href} className="btn btn-primary !px-4 !py-2.5 !text-xs">
              {action} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
          )}
          {extraLink && (
            <a href={extraLink.href} target="_blank" rel="noreferrer" className="btn btn-ghost !px-4 !py-2.5 !text-xs">
              <Icon name="facebook" /> {extraLink.label}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
