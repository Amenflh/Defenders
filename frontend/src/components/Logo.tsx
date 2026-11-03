import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/images";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Defenders Fitness Academy — accueil">
      <Image
        src={brand.logo}
        alt=""
        width={44}
        height={44}
        className="size-11 rounded-full ring-1 ring-white/15 transition-transform duration-500 group-hover:rotate-[360deg]"
      />
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-lg font-semibold tracking-[0.18em] uppercase">Defenders</span>
          <span className="block text-[0.62rem] tracking-[0.34em] text-mist uppercase">Fitness Academy</span>
        </span>
      )}
    </Link>
  );
}
