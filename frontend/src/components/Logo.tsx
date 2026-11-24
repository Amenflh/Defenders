import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { brand } from "@/lib/images";
import { site } from "@/lib/site";

export type BrandIdentity = { logoUrl?: string | StaticImageData; brandName?: string; brandDescriptor?: string };

export function Logo({ compact = false, logoUrl = brand.logo, brandName = site.shortName, brandDescriptor = site.descriptor }: BrandIdentity & { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={`${brandName} ${brandDescriptor} — accueil`}>
      <Image
        src={logoUrl}
        alt=""
        width={44}
        height={44}
        // Fichiers locaux : optimisés par Next (format moderne, taille réduite). Logos externes ou SVG : tels quels.
        unoptimized={typeof logoUrl === "string" && (!logoUrl.startsWith("/") || logoUrl.startsWith("//") || logoUrl.endsWith(".svg"))}
        priority
        className={`${compact ? "size-10" : "size-10 sm:size-11"} shrink-0 rounded-full bg-white object-contain ring-1 ring-white/15 transition-transform duration-500 group-hover:rotate-[360deg]`}
      />
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-lg font-semibold tracking-[0.18em] uppercase">{brandName}</span>
          <span className="block text-[0.62rem] tracking-[0.34em] text-mist uppercase">{brandDescriptor}</span>
        </span>
      )}
    </Link>
  );
}
