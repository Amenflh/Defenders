import { instagramEmbed, isFacebookVideo, isVideoFile, youtubeEmbed } from "@/lib/video";
import { FacebookVideoEmbed, type FacebookVideoLayout } from "./FacebookVideoEmbed";

const ASPECT: Record<FacebookVideoLayout, string> = {
  portrait: "aspect-[9/16] max-w-[360px]",
  square: "aspect-square max-w-[480px]",
  landscape: "aspect-video max-w-none",
};

/** Vidéo collée dans l'admin : Facebook, Instagram, YouTube ou fichier MP4 / WebM, dans le même cadre. */
export function VideoEmbed({ url, title, layout = "portrait", loading = "lazy", fit = "contain" }: {
  url: string;
  title: string;
  layout?: FacebookVideoLayout;
  loading?: "eager" | "lazy";
  /** « cover » : remplit le parent (positionné). */
  fit?: "contain" | "cover";
}) {
  if (isFacebookVideo(url)) return <FacebookVideoEmbed url={url} title={title} layout={layout} loading={loading} fit={fit} />;

  const frame = fit === "cover" ? "absolute inset-0 overflow-hidden bg-black" : `relative mx-auto w-full overflow-hidden bg-black ${ASPECT[layout]}`;
  const iframe = instagramEmbed(url) ?? youtubeEmbed(url);
  if (iframe) {
    return (
      <div className={frame}>
        <iframe
          src={iframe}
          title={title}
          loading={loading}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }
  if (isVideoFile(url) || url.startsWith("/")) {
    return (
      <div className={frame}>
        <video src={url} aria-label={title || undefined} controls muted loop playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${frame} grid place-items-center p-6 text-center`}>
      <a href={url} target="_blank" rel="noreferrer" className="text-sm text-gold underline underline-offset-4">{title || url}</a>
    </div>
  );
}
