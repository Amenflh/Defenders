import type { Metadata } from "next";
import Link from "next/link";
import { safeNext } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;

  return (
    <>
      <p className="eyebrow mb-3">Bienvenue</p>
      <h1 className="font-display text-4xl tracking-wide uppercase">Connexion</h1>
      <p className="mt-3 text-mist">
        Connectez-vous pour découvrir nos formations et vous inscrire. Les administrateurs accèdent à leur tableau de
        bord avec le même formulaire.
      </p>

      <div className="mt-8">
        <LoginForm next={safeNext(next) ?? undefined} />
      </div>

      <p className="mt-8 border-t border-line pt-6 text-sm text-mist">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-gold hover:text-gold-soft">
          Créer un compte client
        </Link>
      </p>
    </>
  );
}
