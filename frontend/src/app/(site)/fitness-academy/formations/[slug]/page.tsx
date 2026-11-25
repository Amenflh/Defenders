import type { Metadata } from "next";
import { FormationRoute, formationMetadata } from "@/components/FormationRoute";

export async function generateMetadata({ params }: PageProps<"/fitness-academy/formations/[slug]">): Promise<Metadata> {
  return formationMetadata((await params).slug);
}

export default async function Page({ params }: PageProps<"/fitness-academy/formations/[slug]">) {
  return <FormationRoute slug={(await params).slug} academy="fitness" />;
}
