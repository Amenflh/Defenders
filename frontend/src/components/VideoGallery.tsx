"use client";

import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import type { Photo } from "@/lib/images";

export type AcademyVideo = {
  title: string;
  description: string;
  href: string;
  src?: string;
  photo: Photo;
};

export function VideoGallery({ videos }: { videos: AcademyVideo[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {videos.map((video, index) => (
        <Reveal key={video.href} delay={index * 100} className="overflow-hidden border border-line bg-ink">
          <Dialog>
            <DialogTrigger className="group block w-full text-left">
              <div className="relative aspect-[4/5] overflow-hidden bg-ink-3">
                <video src={video.src} muted loop autoPlay playsInline preload="metadata" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 grid size-12 place-items-center rounded-full border border-bone/70 bg-ink/75 text-bone transition-transform group-hover:scale-110">
                  <span className="ml-0.5">▶</span>
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-4 p-5 sm:p-6">
                <div>
                  <p className="eyebrow mb-2 text-[0.68rem]">Vidéo Defenders</p>
                  <h3 className="font-display text-xl uppercase sm:text-2xl">{video.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-mist">{video.description}</p>
                </div>
                <span className="grid size-10 place-items-center rounded-full border border-line text-gold transition group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                  <Icon name="arrow" width={18} height={18} />
                </span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <DialogTitle className="font-display text-sm uppercase text-bone">{video.title}</DialogTitle>
                <DialogClose aria-label="Fermer la vidéo" className="grid size-9 place-items-center rounded-full border border-line text-bone hover:border-gold hover:text-gold">×</DialogClose>
              </div>
              <video src={video.src} controls autoPlay playsInline preload="metadata" className="max-h-[72vh] w-full bg-black object-contain" />
            </DialogContent>
          </Dialog>
        </Reveal>
      ))}
    </div>
  );
}
