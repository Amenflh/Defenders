import type { Metadata } from "next";
import Link from "next/link";
import { safeNext } from "@/lib/session";
import { RegisterForm } from "./RegisterForm";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).t.pages.auth.registerMeta };
}

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = safeNext((await searchParams).next) ?? undefined;
  const A = (await getDictionary()).t.pages.auth;
  return (
    <>
      <p className="eyebrow mb-3">{A.newTrainee}</p>
      <h1 className="font-display text-4xl tracking-wide uppercase">{A.registerTitle}</h1>
      <p className="mt-3 text-mist">{A.registerText}</p>

      <div className="mt-8">
        <RegisterForm next={next} />
      </div>

      <p className="mt-8 border-t border-line pt-6 text-sm text-mist">
        {A.already}{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-medium text-gold hover:text-gold-soft">
          {A.login}
        </Link>
      </p>
    </>
  );
}
