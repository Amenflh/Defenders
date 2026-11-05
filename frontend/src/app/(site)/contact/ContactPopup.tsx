"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { DisciplineSlug } from "@/lib/disciplines";
import { ContactForm, type ContactDefaults } from "./ContactForm";

export function ContactPopup({ preselected, defaults }: { preselected?: DisciplineSlug; defaults?: ContactDefaults }) {
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
    <Dialog open>
      <DialogContent
        className="max-w-3xl overflow-y-auto p-0"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-2 px-5 py-4 sm:px-7">
          <DialogTitle className="font-display text-lg uppercase tracking-[0.08em] text-bone">
            Demande d&apos;inscription
          </DialogTitle>
          <span className="border border-line px-3 py-1.5 text-[0.65rem] tracking-[0.16em] text-mist uppercase">
            À compléter
          </span>
        </div>
        <div className="px-5 py-6 sm:px-7 sm:py-8">
          {successMessage && (
            <p role="status" className="mb-5 border border-gold/40 bg-gold/10 px-5 py-4 text-sm text-bone">
              {successMessage}
            </p>
          )}
          <ContactForm preselected={preselected} defaults={defaults} variant="reservation" onSuccess={onSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
