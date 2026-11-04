import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { AVAILABILITY_LABELS, PROFILE_LABELS, STATUS_LABELS, TRAINING_LABELS, dateFmt } from "@/lib/labels";
import { apiFetch, getCurrentUser } from "@/lib/session";
import { StatusSelect } from "./StatusSelect";

type Contact = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  profile: string;
  trainings: string[];
  availability: string;
  message: string;
  status: string;
};

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const user = await getCurrentUser();
  if (user === "unavailable" || user === null) {
    return (
      <section className="container-site">
        <h1 className="heading-lg">Espace admin</h1>
        <p className="mt-4 text-mist">L&apos;API ne répond pas. Vérifiez que le backend et PostgreSQL sont démarrés.</p>
      </section>
    );
  }

  const { status } = await searchParams;
  const filter = typeof status === "string" && status in STATUS_LABELS ? status : undefined;
  const res = await apiFetch(`/api/admin/contacts${filter ? `?status=${filter}` : ""}`);
  if (res.status === 401) redirect("/login?next=/admin");
  const data = res.ok ? ((await res.json()) as { contacts: Contact[]; counts: Record<string, number> }) : null;
  const total = data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <section className="container-site">
      <div className="mb-10">
        <p className="eyebrow mb-2">Espace admin</p>
        <h1 className="heading-lg">Demandes d&apos;inscription</h1>
        <p className="mt-2 text-sm text-mist">Connecté en tant que {user.name} ({user.email})</p>
      </div>

      <nav aria-label="Filtrer par statut" className="mb-8 flex flex-wrap gap-2">
        {[{ value: undefined, label: "Toutes", count: total }, ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label, count: data?.counts[value] ?? 0 }))].map(
          (f) => {
            const active = f.value === filter;
            return (
              <Link
                key={f.label}
                href={f.value ? `/admin?status=${f.value}` : "/admin"}
                aria-current={active ? "page" : undefined}
                className={`border px-4 py-2 font-display text-sm tracking-[0.12em] uppercase transition-colors ${
                  active ? "border-gold bg-gold text-ink" : "border-line text-mist hover:border-bone/50 hover:text-bone"
                }`}
              >
                {f.label} <span className="ml-1 text-xs opacity-60">{f.count}</span>
              </Link>
            );
          },
        )}
      </nav>

      {!data ? (
        <p className="text-mist">Impossible de charger les demandes.</p>
      ) : data.contacts.length === 0 ? (
        <div className="border border-line bg-ink-2 p-10 text-center text-mist">Aucune demande pour ce filtre.</div>
      ) : (
        <ul className="space-y-4">
          {data.contacts.map((c) => (
            <li key={c.id} className="border border-line bg-ink-2 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl tracking-wide uppercase">
                    {c.firstName} {c.lastName}
                  </h2>
                  <p className="text-xs text-mist">Reçue le {dateFmt.format(new Date(c.createdAt))}</p>
                </div>
                <StatusSelect id={c.id} status={c.status} labels={STATUS_LABELS} />
              </div>

              <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Info label="E-mail"><a href={`mailto:${c.email}`} className="break-all hover:text-gold">{c.email}</a></Info>
                <Info label="Téléphone"><a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-gold">{c.phone}</a></Info>
                <Info label="Profil">{PROFILE_LABELS[c.profile] ?? c.profile}</Info>
                <Info label="Disponibilité">{AVAILABILITY_LABELS[c.availability] ?? c.availability}</Info>
                <Info label="Formation(s)">{c.trainings.map((t) => TRAINING_LABELS[t] ?? t).join(", ")}</Info>
                {c.city && <Info label="Ville">{c.city}</Info>}
              </dl>
              {c.message && (
                <p className="mt-4 border-l-2 border-gold/50 pl-4 text-sm whitespace-pre-line text-mist">{c.message}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 flex items-center gap-2 text-xs text-mist">
        <Icon name="shield" width={14} height={14} className="text-gold" /> Données personnelles : à utiliser uniquement pour
        recontacter les candidats.
      </p>
    </section>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.65rem] tracking-[0.18em] text-mist uppercase">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
