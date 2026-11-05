import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { FormationPage } from "@/components/FormationPage";
import { Unavailable } from "@/components/Unavailable";
import { getFormation, getFormations } from "@/lib/formations";

export async function generateMetadata({ params }: PageProps<"/formations/[slug]">): Promise<Metadata> {
  const f = await getFormation((await params).slug);
  if (!f || f === "unavailable") return { title: "Formation" };
  return { title: `Formation ${f.name}`, description: f.summary || f.headline };
}

/** Détail d'une formation publiée (#17) : contenu à jour depuis l'API. */
export default async function Page({ params }: PageProps<"/formations/[slug]">) {
  await connection();
  const { slug } = await params;
  const [f, all] = await Promise.all([getFormation(slug), getFormations()]);
  if (f === null) notFound();
  if (f === "unavailable") return <Unavailable what="cette formation" />;
  return <FormationPage f={f} others={(all ?? []).filter((o) => o.slug !== f.slug)} />;
}
