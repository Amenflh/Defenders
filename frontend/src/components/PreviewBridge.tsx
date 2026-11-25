"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { decodeRefs } from "@/lib/preview/markers";
import { parsePreview, PREVIEW_PARAM, previewHref, type FromPreview, type ToPreview } from "@/lib/preview/config";

type Found = { ref: string; kind: "text" | "image"; element: Element };
const ATTRIBUTES = ["placeholder", "aria-label", "title"];

/** Référence portée directement par un élément : son propre texte, puis le texte alternatif d'une image, puis ses attributs. */
function ownText(element: Element): string | undefined {
  for (const node of element.childNodes) if (node.nodeType === Node.TEXT_NODE) {
    const [ref] = decodeRefs(node.nodeValue ?? "");
    if (ref) return ref;
  }
  return undefined;
}

/** Ce qui est modifiable sous le pointeur : le texte d'abord, puis l'image, puis le texte le plus proche. */
function findAt(x: number, y: number): Found | null {
  const stack = document.elementsFromPoint(x, y).filter((el) => !el.closest("[data-preview-ui]"));
  for (const element of stack) {
    const ref = ownText(element);
    if (ref) return { ref, kind: "text", element };
  }
  for (const element of stack) if (element instanceof HTMLImageElement) {
    const [ref] = decodeRefs(element.alt);
    if (ref) return { ref, kind: "image", element };
  }
  for (const element of stack) for (const name of ATTRIBUTES) {
    const [ref] = decodeRefs(element.getAttribute(name) ?? "");
    if (ref) return { ref, kind: "text", element };
  }
  // Icône ou marge d'un bouton, d'un lien ou d'un titre : le texte qu'il contient.
  const block = stack[0]?.closest("a, button, h1, h2, h3, p, li, label, blockquote, dt, dd");
  const inner = block && [...block.querySelectorAll("*")].find((el) => ownText(el));
  return inner ? { ref: ownText(inner)!, kind: "text", element: inner } : null;
}

/** Élément affichant une référence (ou commençant par elle : « f.12 »). */
function findRef(ref: string): Element | null {
  const matches = (value: string) => decodeRefs(value).some((found) => found === ref || found.startsWith(`${ref}.`));
  const root = document.getElementById("contenu") ?? document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (matches(node.nodeValue ?? "") && node.parentElement?.getClientRects().length) return node.parentElement;
  }
  return [...root.querySelectorAll("img")].find((img) => matches(img.alt) && img.getClientRects().length > 0) ?? null;
}

/** Page du site affichée dans l'admin : se met à jour sans rechargement, et signale le texte ou l'image cliqués. */
export function PreviewBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const value = useSearchParams().get(PREVIEW_PARAM);
  const overlay = useRef<HTMLDivElement>(null);
  const edit = useRef(false);
  const [refreshing, startRefresh] = useTransition();
  const wasRefreshing = useRef(false);

  const send = (message: FromPreview) => window.parent.postMessage(message, window.location.origin);

  useEffect(() => {
    if (window.parent !== window) window.parent.postMessage({ type: "dfa:ready", path: pathname } satisfies FromPreview, window.location.origin);
  }, [pathname]);

  useEffect(() => {
    if (wasRefreshing.current && !refreshing) send({ type: "dfa:refreshed" });
    wasRefreshing.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    if (window.parent === window) return;
    const place = (element: Element | null, flash = false) => {
      const box = overlay.current;
      if (!box) return;
      if (!element) {
        box.style.opacity = "0";
        return;
      }
      const rect = element.getBoundingClientRect();
      Object.assign(box.style, { opacity: "1", top: `${rect.top - 5}px`, left: `${rect.left - 5}px`, width: `${rect.width + 10}px`, height: `${rect.height + 10}px` });
      box.dataset.flash = String(flash);
    };

    const onMessage = (event: MessageEvent<ToPreview>) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const message = event.data;
      if (message?.type === "dfa:refresh") startRefresh(() => router.refresh());
      if (message?.type === "dfa:mode") {
        edit.current = message.edit;
        document.documentElement.toggleAttribute("data-preview-edit", message.edit);
        if (!message.edit) place(null);
      }
      if (message?.type === "dfa:focus") {
        const element = findRef(message.ref);
        if (!element) return place(null);
        const rect = element.getBoundingClientRect();
        // Déjà visible : pas de saut de page pendant la frappe.
        if (rect.top < 90 || rect.bottom > window.innerHeight - 20) element.scrollIntoView({ block: "center", behavior: "smooth" });
        window.setTimeout(() => place(element, true), rect.top < 90 || rect.bottom > window.innerHeight - 20 ? 450 : 0);
      }
    };
    const onMove = (event: MouseEvent) => {
      if (edit.current) place(findAt(event.clientX, event.clientY)?.element ?? null);
    };
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-preview-ui]")) return;
      if (edit.current) {
        event.preventDefault();
        event.stopPropagation();
        const found = findAt(event.clientX, event.clientY);
        if (found) send({ type: "dfa:select", ref: found.ref, kind: found.kind, path: window.location.pathname });
        return;
      }
      // Navigation dans l'aperçu : la page suivante garde le brouillon et la langue.
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || event.metaKey || event.ctrlKey) return;
      const url = new URL(link.href, window.location.href);
      const preview = parsePreview(value);
      if (!preview || url.origin !== window.location.origin || link.target === "_blank") return;
      if (url.pathname === window.location.pathname && url.hash) return;
      event.preventDefault();
      event.stopPropagation();
      router.push(previewHref(url.pathname + url.search + url.hash, preview.locale, preview.draftId));
    };
    const block = (event: Event) => {
      // Aucun formulaire n'est envoyé depuis l'aperçu.
      event.preventDefault();
      event.stopPropagation();
    };
    const hide = () => place(null);
    window.addEventListener("message", onMessage);
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", block, true);
    window.addEventListener("scroll", hide, { passive: true });
    document.addEventListener("mouseleave", hide);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", block, true);
      window.removeEventListener("scroll", hide);
      document.removeEventListener("mouseleave", hide);
    };
  }, [router, value]);

  return <div ref={overlay} data-preview-ui aria-hidden="true" className="preview-outline" />;
}
