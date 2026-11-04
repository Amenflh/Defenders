"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "animejs";
import gsap from "gsap";

export function AnimatedAccent({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    gsap.fromTo(ref.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
    animate(ref.current, {
      filter: ["brightness(0.85)", "brightness(1.12)", "brightness(1)"],
      duration: 1100,
      delay: 300,
      easing: "easeInOutSine",
    });
  }, []);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
