"use client";

import { useState } from "react";
import { ContactPopup } from "@/app/(site)/contact/ContactPopup";
import type { ContactInquiryCopy } from "@/app/(site)/contact/ContactForm";

export function HomeContactButton({ className = "btn btn-ghost", label = "Nous contacter", popupTitle, copy }: { className?: string; label?: string; popupTitle?: string; copy?: ContactInquiryCopy }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {open && <ContactPopup mode="inquiry" open={open} onOpenChange={setOpen} title={popupTitle} inquiryCopy={copy} />}
    </>
  );
}
