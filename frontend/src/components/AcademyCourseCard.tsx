import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import { FacebookVideoEmbed } from "./FacebookVideoEmbed";
import type { FacebookVideoLayout } from "./FacebookVideoEmbed";
import { HomeHeroVideo } from "./HomeHeroVideo";
import { Icon } from "./Icon";

export function AcademyCourseCard({
  title,
  text,
  href,
  action,
  poster,
  videoSrc,
  videoEmbedUrl,
  videoLayout = "portrait",
  detail,
  external = false,
  accentClassName,
  priority = false,
}: {
  title: string;
  text: string;
  href: string;
  action: string;
  poster: string | StaticImageData;
  videoSrc?: string;
  videoEmbedUrl?: string;
  videoLayout?: FacebookVideoLayout;
  detail?: string;
  external?: boolean;
  accentClassName?: string;
  priority?: boolean;
}) {
  const posterSrc = typeof poster === "string" ? poster : poster.src;

  return (
    <article className={`flex h-full flex-col overflow-hidden border border-line bg-ink-2 ${accentClassName ?? ""}`}>
      <span className="h-1 w-full bg-gold" aria-hidden="true" />
      {videoEmbedUrl ? (
        <FacebookVideoEmbed url={videoEmbedUrl} title={title} layout={videoLayout} loading={priority ? "eager" : "lazy"} />
      ) : videoSrc ? (
        <div className="relative aspect-video overflow-hidden bg-black">
          <HomeHeroVideo src={videoSrc} poster={posterSrc} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
          <span className="pointer-events-none absolute bottom-4 start-4 grid size-10 place-items-center rounded-full border border-bone/70 bg-ink/75 text-bone" aria-hidden="true">
            <span className="ms-0.5">▶</span>
          </span>
        </div>
      ) : (
        <div className="relative aspect-video overflow-hidden bg-ink">
          <Image
            src={poster}
            alt=""
            fill
            priority={priority}
            unoptimized={typeof poster === "string"}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {detail && <p className="eyebrow mb-3">{detail}</p>}
        <h3 className="font-display text-xl uppercase text-bone sm:text-2xl">{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {external ? (
            <a href={href} target="_blank" rel="noreferrer" className="btn btn-primary !px-4 !py-2.5 !text-xs">
              {action} <Icon name="arrow" className="rtl:-scale-x-100" />
            </a>
          ) : (
            <Link href={href} className="btn btn-primary !px-4 !py-2.5 !text-xs">
              {action} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
