import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Créer un compte" };

export default function RegisterPage() {
  return (
    <>
      <p className="eyebrow mb-3">Nouveau stagiaire</p>
      <h1 className="font-display text-4xl tracking-wide uppercase">Créer un compte</h1>
      <p className="mt-3 text-mist">
        Votre compte vous permet de consulter nos formations, de vous inscrire et de suivre l&apos;état de vos demandes.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-8 border-t border-line pt-6 text-sm text-mist">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-gold hover:text-gold-soft">
          Se connecter
        </Link>
      </p>
    </>
  );
}
