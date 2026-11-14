"use client";

import { useEffect, useRef } from "react";

/** Durée de vie d'un point de la traînée, en millisecondes. */
const TRAIL_LIFETIME = 420;
const MAX_POINTS = 48;

type Point = { x: number; y: number; t: number };

/**
 * Traînée de curseur : le curseur du système reste affiché tel quel, et une fine ligne dorée le suit
 * puis s'efface en s'amincissant. Dessinée sur un canvas plein écran qui n'intercepte aucun clic.
 * Désactivée sur écran tactile et si l'utilisateur a demandé moins d'animations.
 */
export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !finePointer.matches || reducedMotion.matches) return;

    const points: Point[] = [];
    let frame = 0;
    let color = "#c59749";

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      color = getComputedStyle(document.documentElement).getPropertyValue("--color-gold").trim() || color;
    };

    const draw = () => {
      const now = performance.now();
      while (points.length && now - points[0].t > TRAIL_LIFETIME) points.shift();
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (points.length > 1) {
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = color;
        context.shadowColor = color;
        context.shadowBlur = 8;
        // Chaque segment s'affine et s'estompe avec l'âge : la queue disparaît en douceur.
        for (let i = 1; i < points.length; i++) {
          const life = 1 - (now - points[i].t) / TRAIL_LIFETIME;
          const position = i / (points.length - 1);
          context.globalAlpha = Math.max(0, life * position * 0.9);
          context.lineWidth = 0.6 + 2.6 * life * position;
          context.beginPath();
          context.moveTo(points[i - 1].x, points[i - 1].y);
          context.lineTo(points[i].x, points[i].y);
          context.stroke();
        }
        context.globalAlpha = 1;
      }

      frame = points.length ? requestAnimationFrame(draw) : 0;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      points.push({ x: event.clientX, y: event.clientY, t: performance.now() });
      if (points.length > MAX_POINTS) points.shift();
      if (!frame) frame = requestAnimationFrame(draw);
    };
    // Sortie de la fenêtre ou entrée dans une vidéo (iframe) : la traînée se termine proprement.
    const onLeave = (event: MouseEvent) => { if (!event.relatedTarget) points.length = 0; };
    const disable = () => {
      if (finePointer.matches && !reducedMotion.matches) return;
      cleanup();
    };
    const themeObserver = new MutationObserver(resize);

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onLeave);
    finePointer.addEventListener("change", disable);
    reducedMotion.addEventListener("change", disable);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    function cleanup() {
      cancelAnimationFrame(frame);
      frame = 0;
      points.length = 0;
      context?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onLeave);
      finePointer.removeEventListener("change", disable);
      reducedMotion.removeEventListener("change", disable);
      themeObserver.disconnect();
    }
    return cleanup;
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="cursor-trail" />;
}
