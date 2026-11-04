import type { Metadata } from "next";
import { DisciplinePage } from "@/components/DisciplinePage";
import { disciplines } from "@/lib/disciplines";

const d = disciplines.football;

export const metadata: Metadata = { title: `Formation ${d.name}`, description: d.summary };

export default function Page() {
  return <DisciplinePage d={d} />;
}
