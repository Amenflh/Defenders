"use client";

export type FacebookVideoLayout = "portrait" | "square" | "landscape";

type FacebookVideoEmbedProps = {
  url: string;
  title: string;
  layout?: FacebookVideoLayout;
  loading?: "eager" | "lazy";
  loop?: boolean;
  background?: boolean;
};

export function FacebookVideoEmbed({
  url,
  title,
  layout = "portrait",
  loading = "lazy",
  loop = false,
  background = false,
}: FacebookVideoEmbedProps) {
  const embedUrl = new URL("https://www.facebook.com/plugins/video.php");
  embedUrl.searchParams.set("href", url);
  embedUrl.searchParams.set("show_text", "0");
  embedUrl.searchParams.set("width", layout === "portrait" ? "360" : layout === "square" ? "480" : "560");
  embedUrl.searchParams.set("autoplay", "true");
  embedUrl.searchParams.set("mute", "true");
  if (loop) embedUrl.searchParams.set("loop", "true");
  const aspectClassName = layout === "portrait"
    ? "aspect-[9/16] max-w-[360px]"
    : layout === "square"
      ? "aspect-square max-w-[480px]"
      : "aspect-video max-w-none";

  return (
    <div
      aria-hidden={background || undefined}
      className={background
        ? "pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-black"
        : `relative mx-auto w-full overflow-hidden bg-black ${aspectClassName}`}
    >
      <iframe
        src={embedUrl.toString()}
        title={title}
        loading={background ? "eager" : loading}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        tabIndex={background ? -1 : undefined}
        className={background
          ? "absolute left-1/2 top-1/2 h-[56.25vw] min-h-[68svh] w-screen min-w-[120.89svh] -translate-x-1/2 -translate-y-1/2 border-0"
          : "absolute inset-0 size-full border-0"}
      />
    </div>
  );
}
