"use client";

type FacebookVideoEmbedProps = {
  url: string;
  title: string;
  layout?: "portrait" | "landscape";
  loading?: "eager" | "lazy";
};

export function FacebookVideoEmbed({ url, title, layout = "portrait", loading = "lazy" }: FacebookVideoEmbedProps) {
  const embedUrl = new URL("https://www.facebook.com/plugins/video.php");
  embedUrl.searchParams.set("href", url);
  embedUrl.searchParams.set("show_text", "0");
  embedUrl.searchParams.set("width", layout === "portrait" ? "360" : "560");
  embedUrl.searchParams.set("autoplay", "true");
  embedUrl.searchParams.set("mute", "true");

  return (
    <div className={`relative mx-auto w-full overflow-hidden bg-black ${layout === "portrait" ? "aspect-[9/16] max-w-[360px]" : "aspect-video max-w-none"}`}>
      <iframe
        src={embedUrl.toString()}
        title={title}
        loading={loading}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
