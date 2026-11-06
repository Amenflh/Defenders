"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

/** Logo WhatsApp (pictogramme officiel simplifié). */
function WhatsAppIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.2 4.24-9.44 9.45-9.44a9.38 9.38 0 0 1 6.68 2.77 9.38 9.38 0 0 1 2.76 6.68c0 5.2-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.7l6.1-1.6a11.33 11.33 0 0 0 5.37 1.37h.01c6.26 0 11.36-5.1 11.37-11.37 0-3.03-1.18-5.89-3.33-8.03" />
    </svg>
  );
}

/**
 * Bouton flottant présent sur tout le site public : WhatsApp en un clic,
 * et un menu pour appeler ou lancer le quiz d'orientation.
 */
export function FloatingActions() {
  const pathname = usePathname();
  // Le menu est lié à la page où il a été ouvert : changer de page le referme.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);
  const [visible, setVisible] = useState(false);

  // Apparaît après un léger défilement, pour ne pas masquer la bannière d'accueil au chargement.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const message = encodeURIComponent("Bonjour, je souhaite avoir des informations sur vos formations.");
  const actions = [
    { href: `${site.whatsapp.href}?text=${message}`, label: "Écrire sur WhatsApp", external: true, icon: <WhatsAppIcon className="size-5" /> },
    { href: site.phone.href, label: `Appeler ${site.phone.label}`, icon: <Icon name="phone" width={18} height={18} /> },
    ...(pathname === "/trouver-ma-formation" ? [] : [{ href: "/trouver-ma-formation", label: "Trouver ma formation", internal: true, icon: <Icon name="star" width={18} height={18} /> }]),
  ];

  return (
    <div className={`fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 transition-all duration-500 sm:right-6 sm:bottom-6 ${visible || open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      {open && (
        <ul id="floating-actions" className="flex flex-col items-end gap-2 animate-[fade-in_0.25s_ease]">
          {actions.map((a) => {
            const className = "flex items-center gap-3 border border-line bg-ink-2/95 py-2.5 pr-3 pl-4 text-sm text-bone shadow-2xl backdrop-blur-md transition-colors hover:border-gold hover:text-gold";
            const content = <><span>{a.label}</span><span className="grid size-8 place-items-center bg-ink text-gold">{a.icon}</span></>;
            return (
              <li key={a.label}>
                {"internal" in a ? (
                  <Link href={a.href} className={className}>{content}</Link>
                ) : (
                  <a href={a.href} {...("external" in a ? { target: "_blank", rel: "noreferrer" } : {})} className={className}>{content}</a>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="floating-actions"
        aria-label={open ? "Fermer le menu de contact" : "Nous contacter rapidement"}
        className={`fab-pulse grid size-14 place-items-center rounded-full text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 ${open ? "bg-ink-3" : "bg-[#1fa855] animate-[fab-pulse_2.4s_ease-out_infinite]"}`}
      >
        {open ? <Icon name="close" width={22} height={22} /> : <WhatsAppIcon className="size-7" />}
      </button>
    </div>
  );
}
