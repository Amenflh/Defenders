export const inputClass = (invalid: boolean) =>
  `w-full border bg-ink-2 px-4 py-3 text-bone placeholder:text-mist/50 focus:border-gold focus:outline-none ${invalid ? "border-red-500/70" : "border-line"}`;
