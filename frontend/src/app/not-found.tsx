import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getDictionary();
  const n = t.pages.notFound;
  return (
    <section className="container-site flex min-h-[70vh] flex-col items-start justify-center pt-24">
      <p className="eyebrow mb-4">{n.eyebrow}</p>
      <h1 className="heading-xl">{n.title}</h1>
      <p className="mt-6 max-w-md text-mist">{n.text}</p>
      <Link href="/" className="btn btn-primary mt-10">
        {n.back}
      </Link>
    </section>
  );
}
