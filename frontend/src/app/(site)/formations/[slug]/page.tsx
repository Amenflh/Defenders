import { LegacyFormationRedirect } from "@/components/FormationRoute";

export default async function Page({ params }: PageProps<"/formations/[slug]">) {
  return <LegacyFormationRedirect slug={(await params).slug} />;
}
