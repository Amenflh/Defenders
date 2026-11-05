import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AdminShell } from "./AdminShell";

export const metadata: Metadata = {
  title: "Espace admin",
  robots: { index: false, follow: false },
};

/** Réservé aux administrateurs : un client connecté est renvoyé vers l'accueil. */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();
  if (user === null) redirect("/login?next=/admin");
  if (user !== "unavailable" && user.role !== "admin") redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
