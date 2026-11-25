import { getHistory } from "@/lib/academy-content";
import { getDictionary } from "@/lib/i18n/server";
import { getContacts } from "@/lib/settings";
import Link from "next/link";
import { Icon } from "./Icon";

/** Formations proposées en exclusivité en Tunisie (football et sécurité). */
const EXCLUSIVE = /football|securite|security/;

/** Bandeau sous le héros d'une formation : suivi médical, et exclusivité nationale pour le football. */
export async function FormationHighlights({ slug }: { slug: string }) {
  const [{ t }, contacts] = await Promise.all([getDictionary(), getContacts()]);
  const h = t.highlights;
  const exclusive = EXCLUSIVE.test(slug);
  return (
    <section className="border-t border-line bg-ink-2">
      <div className="container-site">
      <div className={`grid gap-px bg-line ${exclusive ? "md:grid-cols-2" : ""}`}>
        <div className="flex items-start gap-4 bg-ink-2 py-6 md:pe-8">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Icon name="medical" /></span>
          <div>
            <p className="font-display text-lg uppercase">{h.medical.title}</p>
            <p className="mt-1 text-sm text-mist">{h.medical.text}</p>
          </div>
        </div>
        {exclusive && (
          <div className="flex items-start gap-4 bg-ink-2 py-6 md:ps-8">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-ink"><Icon name="award" /></span>
            <div>
              <p className="font-display text-lg uppercase">{h.exclusive.title}</p>
              <p className="mt-1 text-sm text-mist">{h.exclusive.text}</p>
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <a href={contacts.documents.otdav} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-gold hover:text-gold-soft">
                  <Icon name="file" width={16} height={16} /> {h.exclusive.certificate}
                </a>
                <a href={contacts.documents.exclusivityPost} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-gold hover:text-gold-soft">
                  <Icon name="facebook" width={16} height={16} /> {h.exclusive.post}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}

/** Renvoi vers la page Historique, filtrée sur l'activité. Rien si aucune session n'est connue. */
export async function FormationHistoryLink({ slug }: { slug: string }) {
  const count = (await getHistory()).filter((entry) => entry.activity === slug && entry.status === "completed").length;
  if (!count) return null;
  const { t } = await getDictionary();
  return (
    <section className="border-t border-line py-14">
      <div className="container-site"><div className="flex flex-col items-start justify-between gap-6 border border-line bg-ink-2 p-6 sm:flex-row sm:items-center sm:p-7">
        <div>
          <p className="eyebrow mb-2">{t.history.eyebrow}</p>
          <p className="font-display text-2xl uppercase">{t.history.linkTitle(count)}</p>
          <p className="mt-2 text-sm text-mist">{t.history.intro}</p>
        </div>
        <Link href={`/historique?activite=${slug}`} className="btn btn-primary shrink-0">
          {t.history.seeAll} <Icon name="arrow" className="rtl:-scale-x-100" />
        </Link>
      </div></div>
    </section>
  );
}
