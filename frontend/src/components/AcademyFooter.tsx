"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { AcademyFooterVariant } from "@/lib/academy-footer";
import { Icon } from "./Icon";
import { Logo, type BrandIdentity } from "./Logo";

function useAcademyVariant(variants: AcademyFooterVariant[]) {
  const pathname = usePathname();
  return variants.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
}

export function AcademyFooterBrand({
  identity,
  tagline,
  branches,
  certificationLabel,
  approval,
  comingSoonLabel,
  variants,
}: {
  identity: BrandIdentity;
  tagline: string;
  branches: ReadonlyArray<{ name: string; href: string; comingSoon: boolean }>;
  certificationLabel: string;
  approval: string;
  comingSoonLabel: string;
  variants: AcademyFooterVariant[];
}) {
  const variant = useAcademyVariant(variants);
  const activeIdentity = variant?.identity ?? identity;

  return (
    <div className="space-y-5">
      <Logo {...activeIdentity} />
      <p className="max-w-xs text-sm leading-relaxed text-mist">{variant?.tagline ?? tagline}.</p>
      <ul className="space-y-1.5 text-xs text-mist">
        {branches.map((branch) => (
          <li key={branch.name} className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            {branch.href ? (
              <Link href={branch.href} className="transition-colors hover:text-bone">
                {branch.comingSoon ? comingSoonLabel : branch.name}
              </Link>
            ) : comingSoonLabel}
          </li>
        ))}
      </ul>
      <p className="inline-flex items-center gap-2 border border-line px-3 py-1.5 text-xs tracking-widest text-mist uppercase">
        <Icon name="shield" width={14} height={14} className="text-gold" />
        {certificationLabel} · {approval}
      </p>
    </div>
  );
}

export function AcademyFooterContact({
  address,
  addressHref,
  phone,
  phone2,
  email,
  facebook,
  instagram,
  directionsLabel,
  contactLabel,
  messengerHref,
  messengerLabel,
  facebookLabel,
  instagramLabel,
  variants,
}: {
  address: string;
  addressHref: string;
  phone: string;
  phone2: string;
  email: string;
  facebook: string;
  instagram: string;
  directionsLabel: string;
  contactLabel: string;
  messengerHref: string;
  messengerLabel: string;
  facebookLabel: string;
  instagramLabel: string;
  variants: AcademyFooterVariant[];
}) {
  const variant = useAcademyVariant(variants);
  const activeAddress = variant?.address ?? address;
  const activePhone = variant?.phone ?? phone;
  const activePhone2 = variant?.phone2 ?? phone2;
  const activeEmail = variant?.email ?? email;
  const activeFacebook = variant?.facebook ?? facebook;
  const activeFacebookLabel = variant?.facebookLabel ?? facebookLabel;
  const activeInstagram = variant?.instagram;

  return (
    <div>
      <h2 className="eyebrow mb-5">{contactLabel}</h2>
      <ul className="space-y-3 text-sm text-mist">
        <li className="border border-line bg-ink p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-start gap-2 text-xs leading-relaxed text-mist">
              <Icon name="pin" width={15} height={15} className="mt-0.5 shrink-0 text-gold" />
              <span>{activeAddress}</span>
            </span>
            <a href={addressHref} target="_blank" rel="noreferrer" className="shrink-0 border border-line px-3 py-2 font-display text-xs uppercase text-bone transition-colors hover:border-gold hover:text-gold">
              {directionsLabel}
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Icon name="phone" width={16} height={16} className="mt-0.5 shrink-0 text-gold" />
          <span>
            <a href={`tel:${activePhone.replace(/\s/g, "")}`} className="block hover:text-bone">{activePhone}</a>
            <a href={`tel:${activePhone2.replace(/\s/g, "")}`} className="block hover:text-bone">{activePhone2}</a>
          </span>
        </li>
        <li>
          <a href={`mailto:${activeEmail}`} className="flex items-center gap-3 break-all hover:text-bone">
            <Icon name="mail" width={16} height={16} className="shrink-0 text-gold" /> {activeEmail}
          </a>
        </li>
        <li>
          <a href={activeFacebook} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-bone">
            <Icon name={variant?.facebookIcon ?? "facebook"} width={16} height={16} className="text-gold" /> {activeFacebookLabel}
          </a>
        </li>
        <li>
          <a href={messengerHref} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-bone">
            <Icon name="chat" width={16} height={16} className="text-gold" /> {messengerLabel}
          </a>
        </li>
        {(activeInstagram || !variant) && (
          <li>
            <a href={activeInstagram ?? instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-bone">
              <Icon name="instagram" width={16} height={16} className="text-gold" /> {instagramLabel}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
