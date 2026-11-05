import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: "Espace admin",
  robots: { index: false, follow: false },
};

/** Réservé aux administrateurs : un client connecté est renvoyé vers l'accueil. */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();
  if (user === null) redirect("/login?next=/admin");
  if (user !== "unavailable" && user.role !== "admin") redirect("/");

  return (
    <div className="min-h-[80vh] pt-28 pb-20">
      <AdminNav />
      {children}
    </div>
  );
}
