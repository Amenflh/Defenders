import type { Contacts } from "@/lib/contacts";
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

export function academyFooterVariants(contacts: Contacts, taglines: {
  fitness: string;
  tsa: string;
  tsaFacebook: string;
}): AcademyFooterVariant[] {
  const fitness = site.branches.find(({ key }) => key === "fitness")!;
  const tsa = site.branches.find(({ key }) => key === "tsa")!;
  const contact = contacts.tunisianSecurityAcademy;

  return [
    {
      href: fitness.href,
      identity: { logoUrl: fitness.logo, brandName: fitness.headerName, brandDescriptor: fitness.headerDescriptor },
      tagline: taglines.fitness,
      address: contacts.address.lines.join(", "),
      phone: contacts.phone.label,
      phone2: contacts.phone2.label,
      email: contacts.email.label,
      facebook: contacts.facebook.href,
      instagram: contacts.instagram.href,
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
      instagram: contact.instagram || undefined,
    },
  ];
}
