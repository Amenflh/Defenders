"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ContactForm, type ContactDefaults, type ContactInquiryCopy } from "./ContactForm";

export function ContactPopup({ preselected, defaults, availableTrainings, mode = "reservation", open = true, onOpenChange, title, inquiryCopy }: { preselected?: string; defaults?: ContactDefaults; availableTrainings?: { value: string; label: string; dot?: string }[]; mode?: "reservation" | "inquiry"; open?: boolean; onOpenChange?: (open: boolean) => void; title?: string; inquiryCopy?: ContactInquiryCopy }) {
  const router = useRouter();
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const onSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    if (redirectTimer.current) clearTimeout(redirectTimer.current);
    redirectTimer.current = setTimeout(() => {
      router.replace("/?inscription=success");
    }, 2200);
  }, [router]);

  useEffect(() => () => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] max-w-3xl overflow-y-auto p-0"
        onEscapeKeyDown={(event) => { if (!onOpenChange) event.preventDefault(); }}
        onPointerDownOutside={(event) => { if (!onOpenChange) event.preventDefault(); }}
        onInteractOutside={(event) => { if (!onOpenChange) event.preventDefault(); }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-2 px-5 py-4 sm:px-7">
          <DialogTitle className="font-display text-lg uppercase tracking-[0.08em] text-bone">
            {mode === "inquiry" ? title || "Nous contacter" : "Demande d'inscription"}
          </DialogTitle>
          <div className="flex items-center gap-3">
            {mode === "reservation" && <span className="border border-line px-3 py-1.5 text-[0.65rem] tracking-[0.16em] text-mist uppercase">À compléter</span>}
            {onOpenChange && <DialogClose aria-label="Fermer le formulaire" className="grid size-9 place-items-center border border-line text-xl text-mist hover:border-gold hover:text-bone">×</DialogClose>}
          </div>
        </div>
        <div className="px-5 py-6 sm:px-7 sm:py-8">
          {successMessage && (
            <p role="status" className="mb-5 border border-gold/40 bg-gold/10 px-5 py-4 text-sm text-bone">
              {successMessage}
            </p>
          )}
          <ContactForm preselected={preselected} defaults={defaults} availableTrainings={availableTrainings} variant={mode === "inquiry" ? "inquiry" : "reservation"} inquiryCopy={inquiryCopy} onSuccess={mode === "reservation" ? onSuccess : undefined} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
