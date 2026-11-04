"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm data-[state=open]:animate-[overlay-in_.2s_ease-out]" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn("fixed left-1/2 top-1/2 z-[81] max-h-[90vh] w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-line bg-ink-2 shadow-2xl data-[state=open]:animate-[dialog-in_.2s_ease-out]", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogTitle = DialogPrimitive.Title;
