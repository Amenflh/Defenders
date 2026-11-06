import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DisciplinePage } from "@/components/DisciplinePage";
import { mergeFormationContent, type FormationContent } from "@/lib/formation-content";
import { apiFetch } from "@/lib/session";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await apiFetch(`/api/formations/${encodeURIComponent(slug)}`);
  if (!res.ok) return { title: "Formation introuvable" };
  const data = await res.json() as { formation: FormationContent };
  return { title: `Formation ${data.formation.name}`, description: data.formation.summary };
}

export default async function DynamicFormationPage({ params }: Props) {
  const { slug } = await params;
  const res = await apiFetch(`/api/formations/${encodeURIComponent(slug)}`);
  if (!res.ok) notFound();
  const data = await res.json() as { formation: FormationContent };
  return <DisciplinePage d={mergeFormationContent(undefined, data.formation)} />;
}
