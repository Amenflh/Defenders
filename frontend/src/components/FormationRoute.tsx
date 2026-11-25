import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { connection } from "next/server";
import { formationHref, type Academy } from "@/lib/academies";
import { getFormation, getFormations } from "@/lib/formations";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { FormationPage } from "./FormationPage";
import { Unavailable } from "./Unavailable";

/** Page d'une formation : même adresse (Accueil / Académie / Formation) et même contenu pour les deux académies. */
export async function FormationRoute({ slug, academy }: { slug: string; academy: Academy }) {
  await connection();
  const [f, all] = await Promise.all([getFormation(slug), getFormations(academy)]);
  if (f === null) notFound();
  if (f === "unavailable") return <Unavailable />;
  if (f.academy !== academy) permanentRedirect(formationHref(f));
  return <FormationPage f={f} others={(all ?? []).filter((o) => o.slug !== f.slug)} />;
}

export async function formationMetadata(slug: string): Promise<Metadata> {
  const [source, { locale, t }] = await Promise.all([getFormation(slug), getDictionary()]);
  if (!source || source === "unavailable") return { title: t.common.formations };
  const f = localizeFormation(source, locale);
  return { title: t.pages.formation.imageAlt(f.name), description: f.summary || f.headline };
}

/** Anciennes adresses (/formations/pilates, /pilates…) : redirigées vers la page de la formation. */
export async function LegacyFormationRedirect({ slug }: { slug: string }) {
  await connection();
  const f = await getFormation(slug);
  if (f === null) notFound();
  if (f === "unavailable") return <Unavailable />;
  permanentRedirect(formationHref(f));
}
