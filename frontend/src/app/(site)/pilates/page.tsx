import type { Metadata } from "next";
import { DisciplinePage } from "@/components/DisciplinePage";
import { disciplines } from "@/lib/disciplines";
import { mergeFormationContent, type FormationContent } from "@/lib/formation-content";
import { apiFetch } from "@/lib/session";

const d = disciplines.pilates;

export const metadata: Metadata = { title: `Formation ${d.name}`, description: d.summary };

export default async function Page() {
  const fallback = disciplines.pilates;
  const res = await apiFetch("/api/content/formations/pilates");
  if (!res.ok) return <DisciplinePage d={fallback} />;
  const data = await res.json() as { formation: FormationContent };
  return <DisciplinePage d={mergeFormationContent(fallback, data.formation)} />;
}
