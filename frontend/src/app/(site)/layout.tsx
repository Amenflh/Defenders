import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getFormations } from "@/lib/formations";
import { getCurrentUser } from "@/lib/session";

/** Toutes les pages du site exigent d'être connecté (admin ou client). */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, formations] = await Promise.all([getCurrentUser(), getFormations()]);
  // Session absente ou expirée → connexion. Si l'API est injoignable, on laisse naviguer.
  if (user === null) redirect("/login");

  return (
    <>
      <Header user={user === "unavailable" ? null : user} />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer formations={(formations ?? []).map(({ slug, name }) => ({ slug, name }))} />
    </>
  );
}
