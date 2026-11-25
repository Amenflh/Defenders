"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { uploadFile } from "./uploadFile";

/** Import d'une image depuis l'ordinateur ; l'adresse obtenue est transmise à `onUploaded`. */
export function ImageUpload({ label, url, onUploaded }: { label: string; url?: string; onUploaded: (url: string) => void }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  return (
    <div>
      <label className="flex min-h-16 cursor-pointer items-center justify-center border border-dashed border-line bg-ink px-4 py-3 text-center text-xs text-mist transition-colors hover:border-gold hover:text-bone">
        <span>{pending ? "Importation…" : `${label} · JPEG, PNG, WebP`}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={pending} onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          startTransition(async () => {
            const result = await uploadFile(file);
            if (result.file?.type === "image") {
              onUploaded(result.file.url);
              setMessage({ text: "Image importée. Enregistrez pour publier.", error: false });
            } else {
              setMessage({ text: result.error ?? "Échec de l'importation. Vérifiez le format et la taille.", error: true });
            }
          });
          event.currentTarget.value = "";
        }} />
      </label>
      {message && <p role={message.error ? "alert" : "status"} className={`mt-1 text-xs ${message.error ? "text-red-300" : "text-gold"}`}>{message.text}</p>}
      {url && <div className="relative mt-2 h-32 w-full border border-line bg-ink"><Image src={url} alt="" fill sizes="320px" className="object-contain" unoptimized /></div>}
    </div>
  );
}
