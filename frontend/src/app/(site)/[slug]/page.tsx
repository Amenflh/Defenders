import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DisciplinePage } from "@/components/DisciplinePage";
import { mergeFormationContent, type FormationContent } from "@/lib/formation-content";
import { apiFetch } from "@/lib/session";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await apiFetch(`/api/formations/${encodeURIComponent(slug)}`);
  const { locale, t } = await getDictionary();
  if (!res.ok) return { title: t.pages.notFound.title };
  const data = await res.json() as { formation: FormationContent };
  const f = localizeFormation(data.formation, locale);
  return { title: t.pages.formation.imageAlt(f.name), description: f.summary };
}

export default async function DynamicFormationPage({ params }: Props) {
  const { slug } = await params;
  const res = await apiFetch(`/api/formations/${encodeURIComponent(slug)}`);
  if (!res.ok) notFound();
  const data = await res.json() as { formation: FormationContent };
  return <DisciplinePage d={mergeFormationContent(undefined, data.formation)} />;
}
