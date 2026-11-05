"use client";

import { useState, useTransition } from "react";
import { updateStatusAction } from "./actions";

export function StatusSelect({ id, status, labels }: { id: string; status: string; labels: Record<string, string> }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="text-mist">Statut</span>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          const previous = value;
          setValue(next);
          setError(false);
          startTransition(async () => {
            const { ok } = await updateStatusAction(id, next);
            if (!ok) {
              setValue(previous);
              setError(true);
            }
          });
        }}
        className="border border-line bg-ink px-3 py-2 text-bone focus:border-gold focus:outline-none disabled:opacity-60"
      >
        {Object.entries(labels).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {error && <span className="text-red-300">Échec</span>}
    </label>
  );
}
