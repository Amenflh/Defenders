import { LegacyFormationRedirect } from "@/components/FormationRoute";

/** Anciennes adresses courtes (/pilates, /football, /personal-training, /slug). */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <LegacyFormationRedirect slug={(await params).slug} />;
}
