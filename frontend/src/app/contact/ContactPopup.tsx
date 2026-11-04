"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import type { DisciplineSlug } from "@/lib/disciplines";
import { ContactForm } from "./ContactForm";

export function ContactPopup({ preselected }: { preselected?: DisciplineSlug }) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => {
      if (!open) router.replace("/contact");
    }}>
      <DialogContent className="max-w-3xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-2 px-5 py-4 sm:px-7">
          <DialogTitle className="font-display text-lg uppercase tracking-[0.08em] text-bone">
            Demande d&apos;inscription
          </DialogTitle>
          <DialogClose aria-label="Fermer le formulaire" className="grid size-9 place-items-center rounded-full border border-line text-xl text-bone hover:border-gold hover:text-gold">
            ×
          </DialogClose>
        </div>
        <div className="px-5 py-6 sm:px-7 sm:py-8">
          <ContactForm preselected={preselected} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
