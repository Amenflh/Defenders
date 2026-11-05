import Link from "next/link";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

/** État d'erreur quand l'API ne répond pas : on propose de nous contacter directement. */
export function Unavailable({ what }: { what: string }) {
  return (
    <section className="py-24">
      <div className="container-site border border-line bg-ink-2 p-10 text-center">
        <Icon name="calendar" width={36} height={36} className="mx-auto text-gold" />
        <h2 className="mt-4 font-display text-2xl tracking-wide uppercase">Contenu momentanément indisponible</h2>
        <p className="mx-auto mt-3 max-w-md text-mist">
          Nous n&apos;arrivons pas à charger {what} pour le moment. Réessayez dans quelques instants ou contactez-nous.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/contact" className="btn btn-primary">
            Nous contacter
          </Link>
          <a href={site.phone.href} className="btn btn-ghost">
            {site.phone.label}
          </a>
        </div>
      </div>
    </section>
  );
}
