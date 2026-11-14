"use client";

type InstagramReelEmbedProps = {
  url: string;
  title: string;
};

export function InstagramReelEmbed({ url, title }: InstagramReelEmbedProps) {
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden bg-black">
      <iframe
        src={url}
        title={title}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
