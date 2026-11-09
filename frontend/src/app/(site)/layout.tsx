import type { Metadata } from "next";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/session";
import { getSiteSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const brandName = typeof settings.brandName === "string" && settings.brandName ? settings.brandName : "Defenders";
  const brandDescriptor = typeof settings.brandDescriptor === "string" && settings.brandDescriptor ? settings.brandDescriptor : "Fitness Academy";
  const siteName = `${brandName} ${brandDescriptor}`.trim();
  const description = typeof settings.heroDescription === "string" && settings.heroDescription
    ? settings.heroDescription
    : "Des formations certifiantes pour les coachs et les professionnels du sport.";
  const logoUrl = typeof settings.logoUrl === "string" && settings.logoUrl ? settings.logoUrl : "/pics/logo.jpg";

  return {
    title: { default: `${siteName} — Formations certifiantes`, template: `%s | ${siteName}` },
    description,
    icons: { icon: logoUrl },
  };
}

/** Site marketing public. Les layouts enfants protégent les espaces client et administrateur. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSiteSettings()]);
  const identity = {
    logoUrl: typeof settings.logoUrl === "string" && settings.logoUrl ? settings.logoUrl : undefined,
    brandName: typeof settings.brandName === "string" && settings.brandName ? settings.brandName : undefined,
    brandDescriptor: typeof settings.brandDescriptor === "string" && settings.brandDescriptor ? settings.brandDescriptor : undefined,
  };

  return (
    <>
      <Header user={user === "unavailable" ? null : user} identity={identity} />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
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
