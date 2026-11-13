import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcademyProgramPage, type AcademyProgram } from "@/components/AcademyProgramPage";
import { getDictionary } from "@/lib/i18n/server";
import { site } from "@/lib/site";

type ProgramSlug = "k9" | "intervention-initiale" | "protection-rapprochee";

function isProgramSlug(slug: string): slug is ProgramSlug {
  return slug === "k9" || slug === "intervention-initiale" || slug === "protection-rapprochee";
}

function programFor(slug: ProgramSlug, copy: Awaited<ReturnType<typeof getDictionary>>["t"]["pages"]["akAcademy"]): AcademyProgram {
  if (slug === "k9") {
    return {
      slug,
      title: copy.k9CourseTitle,
      eyebrow: copy.k9CourseEyebrow,
      duration: copy.k9CourseDuration,
      summary: copy.k9CourseText,
      topics: copy.k9CourseTopics,
      practical: copy.k9CoursePractical,
      poster: "/pics/partners/TSA-logo.jpg",
      contactHref: site.tunisianSecurityAcademy.k9Contact.href,
      contactLabel: `${copy.k9CourseContact}: ${site.tunisianSecurityAcademy.k9Contact.label}`,
    };
  }

  if (slug === "protection-rapprochee") {
    return {
      slug,
      title: copy.closeProtectionTitle,
      eyebrow: copy.closeProtectionEyebrow,
      duration: copy.durationToConfirm,
      summary: copy.closeProtectionText,
      topics: [],
      practical: copy.closeProtectionPractical,
      poster: "/pics/partners/TSA-logo.jpg",
      videoEmbeds: site.tunisianSecurityAcademy.closeProtectionVideos.map(({ embedUrl, layout }) => ({ url: embedUrl, layout })),
    };
  }

  return {
    slug,
    title: copy.courseTitle,
    eyebrow: copy.courseEyebrow,
    duration: copy.courseDuration,
    summary: copy.courseText,
    topics: copy.courseTopics,
    practical: copy.coursePractical,
    poster: "/pics/partners/TSA-logo.jpg",
    videoEmbeds: site.tunisianSecurityAcademy.firstResponseVideos.map(({ embedUrl, layout }) => ({ url: embedUrl, layout })),
  };
}

export async function generateMetadata({ params }: PageProps<"/ak-tunisian-security-academy/formations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { t } = await getDictionary();
  if (!isProgramSlug(slug)) return { title: t.common.formations };
  const program = programFor(slug, t.pages.akAcademy);
  return { title: program.title, description: program.summary };
}

export default async function TunisianSecurityProgramPage({ params }: PageProps<"/ak-tunisian-security-academy/formations/[slug]">) {
  const { slug } = await params;
  if (!isProgramSlug(slug)) notFound();
  const { t } = await getDictionary();
  return <AcademyProgramPage program={programFor(slug, t.pages.akAcademy)} />;
}
