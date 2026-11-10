import type { Metadata } from "next";
import Link from "next/link";
import { safeNext } from "@/lib/session";
import { LoginForm } from "./LoginForm";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).t.pages.auth.loginMeta };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [{ next }, { t }] = await Promise.all([searchParams, getDictionary()]);
  const A = t.pages.auth;

  return (
    <>
      <p className="eyebrow mb-3">{A.welcome}</p>
      <h1 className="font-display text-4xl tracking-wide uppercase">{A.loginTitle}</h1>
      <p className="mt-3 text-mist">{A.loginText}</p>

      <div className="mt-8">
        <LoginForm next={safeNext(next) ?? undefined} />
      </div>

      <p className="mt-8 border-t border-line pt-6 text-sm text-mist">
        {A.noAccount}{" "}
        <Link href={safeNext(next) ? `/register?next=${encodeURIComponent(safeNext(next)!)}` : "/register"} className="font-medium text-gold hover:text-gold-soft">
          {A.createClient}
        </Link>
      </p>
    </>
  );
}
