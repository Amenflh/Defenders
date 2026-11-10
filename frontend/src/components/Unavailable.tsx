import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

/** État d'erreur quand l'API ne répond pas : on propose de nous contacter directement. */
export async function Unavailable() {
  const { t } = await getDictionary();
  return (
    <section className="py-24">
      <div className="container-site border border-line bg-ink-2 p-10 text-center">
        <Icon name="calendar" width={36} height={36} className="mx-auto text-gold" />
        <h2 className="mt-4 font-display text-2xl tracking-wide uppercase">{t.pages.unavailable.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-mist">{t.pages.unavailable.text}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/contact" className="btn btn-primary">
            {t.home.contactUs}
          </Link>
          <a href={site.phone.href} className="btn btn-ghost">
            {site.phone.label}
          </a>
        </div>
      </div>
    </section>
  );
}
