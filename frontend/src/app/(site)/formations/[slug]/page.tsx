import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { FormationPage } from "@/components/FormationPage";
import { Unavailable } from "@/components/Unavailable";
import { getFormation, getFormations } from "@/lib/formations";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata({ params }: PageProps<"/formations/[slug]">): Promise<Metadata> {
  const [source, { locale, t }] = await Promise.all([getFormation((await params).slug), getDictionary()]);
  if (!source || source === "unavailable") return { title: t.common.formations };
  const f = localizeFormation(source, locale);
  return { title: t.pages.formation.imageAlt(f.name), description: f.summary || f.headline };
}

/** Détail d'une formation publiée (#17) : contenu à jour depuis l'API. */
export default async function Page({ params }: PageProps<"/formations/[slug]">) {
  await connection();
  const { slug } = await params;
  const [f, all] = await Promise.all([getFormation(slug), getFormations()]);
  if (f === null) notFound();
  if (f === "unavailable") return <Unavailable />;
  return <FormationPage f={f} others={(all ?? []).filter((o) => o.slug !== f.slug)} />;
}
