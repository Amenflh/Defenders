"use client";

import { useState, useTransition } from "react";
import { useI18n, useInitialTheme } from "@/lib/i18n/client";
import { setThemeAction } from "@/lib/theme-actions";
import type { Theme } from "@/lib/theme";
import { Icon } from "./Icon";

/** Bascule version sombre / version claire. Le changement est immédiat, puis mémorisé dans un cookie. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>(useInitialTheme());
  const [, startTransition] = useTransition();

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    startTransition(() => setThemeAction(next));
  };

  const label = theme === "light" ? t.common.darkMode : t.common.lightMode;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`grid size-10 place-items-center rounded-full border border-white/20 text-bone transition-colors hover:border-gold hover:text-gold sm:size-11 ${className}`}
    >
      <Icon name={theme === "light" ? "moon" : "sun"} width={18} height={18} />
    </button>
  );
}
