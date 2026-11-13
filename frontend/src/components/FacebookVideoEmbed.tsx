"use client";

type FacebookVideoEmbedProps = {
  url: string;
  title: string;
};

export function FacebookVideoEmbed({ url, title }: FacebookVideoEmbedProps) {
  const embedUrl = new URL("https://www.facebook.com/plugins/video.php");
  embedUrl.searchParams.set("href", url);
  embedUrl.searchParams.set("show_text", "0");
  embedUrl.searchParams.set("width", "560");

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden bg-black">
      <iframe
        src={embedUrl.toString()}
        title={title}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
