"use client";

import { useState } from "react";
import { ContactForm, type ContactDefaults } from "@/app/(site)/contact/ContactForm";
import { Reveal } from "./Reveal";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog";

export type ShowcaseVideo = { title: string; src: string; category?: string };
type Training = { value: string; label: string; dot?: string };

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Formation évoquée par la vidéo (catégorie = slug, ou nom de la formation dans le titre) : pré-cochée dans le formulaire. */
function guessFormation(video: ShowcaseVideo, trainings: Training[]): string | undefined {
  const category = normalize(video.category ?? "");
  const title = normalize(video.title);
  return trainings.find((t) => t.value === category || title.includes(normalize(t.label)) || title.includes(t.value))?.value;
}

/**
 * Vidéos de l'accueil avec appel à l'action : l'aperçu tourne en boucle sans le son ; un clic ouvre le lecteur,
 * et à la fin de la vidéo le formulaire d'inscription express s'affiche automatiquement à sa place.
 */
export function VideoShowcase({ videos, trainings, defaults }: { videos: ShowcaseVideo[]; trainings?: Training[]; defaults?: ContactDefaults }) {
  const [current, setCurrent] = useState<ShowcaseVideo | null>(null);
  const [phase, setPhase] = useState<"video" | "form">("video");

  const open = (video: ShowcaseVideo) => {
    setCurrent(video);
    setPhase("video");
  };

  return (
    <>
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {videos.map((video, index) => (
          <Reveal key={video.src} delay={index * 120}>
            <button
              type="button"
              onClick={() => open(video)}
              className="group mx-auto block w-full max-w-[440px] overflow-hidden border border-line bg-ink-2 text-left focus-visible:outline-2 focus-visible:outline-gold"
              aria-label={`Regarder la vidéo « ${video.title} »`}
            >
              <span className="relative block bg-black">
                <video src={video.src} autoPlay loop muted playsInline preload="metadata" aria-hidden="true" className="mx-auto block max-h-[360px] w-full object-contain transition duration-700 group-hover:scale-[1.02]" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full border border-bone/70 bg-ink/75 text-bone transition-transform group-hover:scale-110">
                    <span className="ml-0.5" aria-hidden="true">▶</span>
                  </span>
                  <span className="text-xs tracking-[0.14em] text-bone uppercase">Regarder avec le son</span>
                </span>
              </span>
              <span className="block px-5 py-4 font-display text-sm uppercase text-gold-soft">{video.title}</span>
            </button>
          </Reveal>
        ))}
      </div>

      <Dialog open={current !== null} onOpenChange={(isOpen) => !isOpen && setCurrent(null)}>
        <DialogContent className="max-h-[92dvh] max-w-3xl overflow-y-auto p-0">
          {current && (
            <>
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-ink-2 px-4 py-3 sm:px-6">
                <DialogTitle className="min-w-0 truncate font-display text-sm uppercase tracking-[0.08em] text-bone">
                  {phase === "video" ? current.title : "Inscription express"}
                </DialogTitle>
                <div className="flex shrink-0 items-center gap-2">
                  {phase === "video" ? (
                    <button type="button" onClick={() => setPhase("form")} className="hidden border border-gold/60 px-3 py-1.5 text-[0.65rem] tracking-[0.14em] text-gold uppercase hover:bg-gold hover:text-ink sm:inline-block">
                      Je m&apos;inscris
                    </button>
                  ) : (
                    <button type="button" onClick={() => setPhase("video")} className="border border-line px-3 py-1.5 text-[0.65rem] tracking-[0.14em] text-mist uppercase hover:border-gold hover:text-bone">
                      Revoir la vidéo
                    </button>
                  )}
                  <DialogClose aria-label="Fermer" className="grid size-9 place-items-center border border-line text-xl text-mist hover:border-gold hover:text-bone">×</DialogClose>
                </div>
              </div>

              {phase === "video" ? (
                <video
                  key={current.src}
                  src={current.src}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  onEnded={() => setPhase("form")}
                  className="max-h-[75dvh] w-full bg-black object-contain"
                />
              ) : (
                <div className="px-5 py-6 animate-[fade-in_0.3s_ease] sm:px-7 sm:py-8">
                  <p className="eyebrow mb-2">Vous avez aimé ?</p>
                  <h2 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">Réservez votre place</h2>
                  <p className="mt-2 mb-8 max-w-xl text-sm text-mist">
                    Laissez vos coordonnées : l&apos;équipe vous rappelle pour les prochaines dates et les modalités d&apos;inscription. Sans engagement.
                  </p>
                  <ContactForm variant="quick" preselected={guessFormation(current, trainings ?? [])} availableTrainings={trainings} defaults={defaults} />
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
