import type { Metadata } from "next";
import { DisciplinePage } from "@/components/DisciplinePage";
import { disciplines } from "@/lib/disciplines";
import { mergeFormationContent, type FormationContent } from "@/lib/formation-content";
import { apiFetch } from "@/lib/session";

const d = disciplines["personal-training"];

export const metadata: Metadata = { title: `Formation ${d.name}`, description: d.summary };

export default async function Page() {
  const fallback = disciplines["personal-training"];
  const res = await apiFetch("/api/content/formations/personal-training");
  if (!res.ok) return <DisciplinePage d={fallback} />;
  const data = await res.json() as { formation: FormationContent };
  const formation = mergeFormationContent(fallback, data.formation);
  return <DisciplinePage d={formation} />;
}
