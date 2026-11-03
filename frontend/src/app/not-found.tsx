import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[70vh] flex-col items-start justify-center pt-24">
      <p className="eyebrow mb-4">Erreur 404</p>
      <h1 className="heading-xl">Page introuvable</h1>
      <p className="mt-6 max-w-md text-mist">La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="btn btn-primary mt-10">
        Retour à l&apos;accueil
      </Link>
    </section>
  );
}
