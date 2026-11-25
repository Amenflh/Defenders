import type { Metadata } from "next";
import { AutoReveal } from "@/components/AutoReveal";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingActions } from "@/components/FloatingActions";
import { FloatingRegister } from "@/components/FloatingRegister";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SocialRail } from "@/components/SocialRail";
import { getCurrentUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n/server";
import { ROUND_LOGO, brandIdentity, getContacts, getSiteSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, { locale, t }] = await Promise.all([getSiteSettings(), getDictionary()]);
  const { siteName, logoUrl = ROUND_LOGO } = brandIdentity(settings);
  const description = locale === "fr" && typeof settings.heroDescription === "string" && settings.heroDescription
    ? settings.heroDescription
    : t.home.heroDescription;

  return {
    title: { default: `${siteName} — Formations certifiantes`, template: `%s | ${siteName}` },
    description,
    icons: { icon: logoUrl },
  };
}

/** Site marketing public. Les layouts enfants protégent les espaces client et administrateur. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, settings, { t }, contacts] = await Promise.all([getCurrentUser(), getSiteSettings(), getDictionary(), getContacts()]);
  const link = (key: "facebook" | "instagram" | "linkedin") => contacts[key].href;
  const { logoUrl, brandName, brandDescriptor } = brandIdentity(settings);
  const identity = { logoUrl, brandName, brandDescriptor };

  return (
    <>
      <Header user={user === "unavailable" ? null : user} identity={identity} />
      <main id="contenu" className="flex-1 pt-16 sm:pt-[4.5rem]">
        {children}
      </main>
      <Footer />
      <AutoReveal />
      <CustomCursor />
      <SocialRail
        label={t.floating.social}
        links={[
          { name: "facebook", label: "Facebook", href: link("facebook") },
          { name: "instagram", label: "Instagram", href: link("instagram") },
          { name: "linkedin", label: "LinkedIn", href: link("linkedin") },
        ]}
      />
      {!(user && user !== "unavailable" && user.role === "admin") && <FloatingRegister />}
      <FloatingActions
        viewer={
          user && user !== "unavailable"
            ? user.role === "admin"
              ? { role: "admin" }
              : { role: "client", firstName: user.name.trim().split(/\s+/)[0] ?? "" }
            : { role: "guest" }
        }
      />
    </>
  );
}
