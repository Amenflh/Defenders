"use client";

import { useState, type KeyboardEvent } from "react";
import type { FacebookVideoLayout } from "./FacebookVideoEmbed";
import { VideoEmbed } from "./VideoEmbed";
import { Icon } from "./Icon";

type Props = {
  videos: { url: string; title: string; layout?: FacebookVideoLayout }[];
  labels: { previous: string; next: string; upNext: string };
};

/**
 * Lecteur vidéo en liste : une grande vidéo encadrée de deux flèches pour basculer, et les vidéos
 * suivantes en petits aperçus (lecture muette) en bas à droite. Un clic sur un aperçu l'affiche en grand.
 * Les flèches du clavier fonctionnent aussi quand le lecteur a le focus.
 */
export function VideoCarousel({ videos, labels }: Props) {
  const [index, setIndex] = useState(0);
  const count = videos.length;
  if (count === 0) return null;

  const current = videos[index];
  const upcoming = Array.from({ length: count - 1 }, (_, i) => (index + i + 1) % count);
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    go((event.key === "ArrowRight") !== rtl ? 1 : -1);
  };

  const arrowClass =
    "grid size-11 shrink-0 place-items-center rounded-full border border-line bg-ink-2/90 text-bone backdrop-blur transition hover:scale-110 hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-gold";

  return (
    <div onKeyDown={count > 1 ? onKeyDown : undefined} className="flex flex-col gap-5 sm:flex-row sm:items-end">
      {/* -------- Grande vidéo -------- */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-center gap-3">
          {count > 1 && (
            <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className={arrowClass}>
              <Icon name="arrow" className="-scale-x-100 rtl:scale-x-100" />
            </button>
          )}

          <div className={`relative w-full ${current.layout === "landscape" ? "" : "max-w-[340px]"}`}>
            <span aria-hidden="true" className="absolute -inset-2 border border-gold/30" />
            <div key={current.url} className="video-swap relative overflow-hidden border border-line bg-ink-2">
              <VideoEmbed url={current.url} title={current.title} layout={current.layout} loading="eager" />
            </div>
          </div>

          {count > 1 && (
            <button type="button" onClick={() => go(1)} aria-label={labels.next} className={arrowClass}>
              <Icon name="arrow" className="rtl:-scale-x-100" />
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-4">
          <p aria-live="polite" className="font-display text-sm tracking-[0.12em] text-bone uppercase">{current.title}</p>
          {count > 1 && (
            <span className="font-display text-xs tracking-[0.2em] text-mist">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>

      {/* -------- Vidéos suivantes (petits aperçus) -------- */}
      {count > 1 && (
        <div className="flex shrink-0 flex-col items-end gap-2 self-end">
          <span className="text-[0.6rem] tracking-[0.2em] text-mist uppercase">{labels.upNext}</span>
          <ul className="flex gap-2 sm:flex-col">
            {upcoming.map((videoIndex, position) => {
              const video = videos[videoIndex];
              return (
                <li key={video.url} className={position > 1 ? "hidden" : undefined}>
                  <button
                    type="button"
                    onClick={() => setIndex(videoIndex)}
                    aria-label={`${labels.upNext} : ${video.title}`}
                    className="group relative block h-[176px] w-[99px] overflow-hidden border border-line bg-black transition hover:-translate-y-1 hover:border-gold focus-visible:outline-2 focus-visible:outline-gold"
                  >
                    {/* Le lecteur Facebook exige une largeur minimale : il est rendu à 220 px puis réduit. */}
                    <span className="absolute top-0 left-0 block w-[220px] origin-top-left scale-[0.45]">
                      <VideoEmbed url={video.url} title={video.title} />
                    </span>
                    <span className="absolute inset-0 z-10 grid place-items-center bg-ink/35 transition group-hover:bg-ink/10">
                      <span className="grid size-9 place-items-center rounded-full border border-bone/60 bg-ink/60 text-bone transition group-hover:scale-110 group-hover:border-gold group-hover:text-gold">
                        <Icon name="play" width={14} height={14} />
                      </span>
                    </span>
                    <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 to-transparent px-2 pt-6 pb-2 text-start text-[0.6rem] leading-tight text-bone">
                      {video.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
