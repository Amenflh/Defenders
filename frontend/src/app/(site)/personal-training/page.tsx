import type { Metadata } from "next";
import { DisciplinePage } from "@/components/DisciplinePage";
import { disciplines } from "@/lib/disciplines";
import { mergeFormationContent, type FormationContent } from "@/lib/formation-content";
import { apiFetch } from "@/lib/session";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";

const d = disciplines["personal-training"];

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  const shown = localizeFormation(d, locale);
  return { title: t.pages.formation.imageAlt(shown.name), description: shown.summary };
}

export default async function Page() {
  const fallback = disciplines["personal-training"];
  const res = await apiFetch("/api/formations/personal-training");
  if (!res.ok) return <DisciplinePage d={fallback} />;
  const data = await res.json() as { formation: FormationContent };
  const formation = mergeFormationContent(fallback, data.formation);
  return <DisciplinePage d={formation} />;
}
