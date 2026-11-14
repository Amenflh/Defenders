import { site } from "@/lib/site";
import type { BrandIdentity } from "@/components/Logo";

export type AcademyFooterVariant = {
  href: string;
  identity: BrandIdentity;
  tagline: string;
  address: string;
  phone: string;
  phone2: string;
  email: string;
  facebook: string;
  facebookLabel?: string;
  facebookIcon?: "facebook" | "arrow";
  instagram?: string;
};

export function academyFooterVariants(taglines: {
  security: string;
  fitness: string;
  tsa: string;
  securityPortal: string;
  tsaFacebook: string;
}): AcademyFooterVariant[] {
  const security = site.branches.find(({ key }) => key === "security")!;
  const fitness = site.branches.find(({ key }) => key === "fitness")!;
  const tsa = site.branches.find(({ key }) => key === "tsa")!;
  const contact = site.tunisianSecurityAcademy;

  return [
    {
      href: security.href,
      identity: { logoUrl: security.logo, brandName: security.headerName, brandDescriptor: security.headerDescriptor },
      tagline: taglines.security,
      address: site.address.lines.join(", "),
      phone: site.phone.label,
      phone2: site.phone2.label,
      email: site.securityEmail.label,
      facebook: site.securityPortal,
      facebookLabel: taglines.securityPortal,
      facebookIcon: "arrow",
    },
    {
      href: fitness.href,
      identity: { logoUrl: fitness.logo, brandName: fitness.headerName, brandDescriptor: fitness.headerDescriptor },
      tagline: taglines.fitness,
      address: site.address.lines.join(", "),
      phone: site.phone.label,
      phone2: site.phone2.label,
      email: site.email.label,
      facebook: site.facebook.href,
      instagram: site.instagram.href,
    },
    {
      href: tsa.href,
      identity: { logoUrl: tsa.logo, brandName: tsa.headerName, brandDescriptor: tsa.headerDescriptor },
      tagline: taglines.tsa,
      address: contact.address.join(", "),
      phone: contact.phone.label,
      phone2: contact.trainingPhone.label,
      email: contact.email.label,
      facebook: contact.facebook,
      facebookLabel: taglines.tsaFacebook,
    },
  ];
}
