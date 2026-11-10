"use client";

import { useState } from "react";
import { ContactPopup } from "@/app/(site)/contact/ContactPopup";
import type { ContactInquiryCopy } from "@/app/(site)/contact/ContactForm";
import { useI18n } from "@/lib/i18n/client";

export function HomeContactButton({ className = "btn btn-ghost", label, popupTitle, copy }: { className?: string; label?: string; popupTitle?: string; copy?: ContactInquiryCopy }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label ?? t.home.contactUs}
      </button>
      {open && <ContactPopup mode="inquiry" open={open} onOpenChange={setOpen} title={popupTitle} inquiryCopy={copy} />}
    </>
  );
}
