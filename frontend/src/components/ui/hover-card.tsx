"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export function HoverCardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content sideOffset={8} className={`z-[60] w-72 border border-line bg-ink-2 p-4 text-bone shadow-2xl data-[state=open]:animate-[dialog-in_.15s_ease-out] ${className}`}>
        {children}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
}
