import Image from "next/image";
import Link from "next/link";
import { formationHref, type Academy } from "@/lib/academies";
import { Reveal } from "./Reveal";

type Card = { id: number; name: string; title: string; bio: string; photoUrl: string | null; formations?: { id: number; name: string; slug: string; academy: Academy }[] };

const FROM = ["left", "up", "right"] as const;
const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

/** Formateurs : photo (ou initiales), spécialité, présentation et formations animées. */
export function TrainerCards({ trainers, className = "", single = false }: { trainers: Card[]; className?: string; /** Une carte par ligne, sur toute la largeur. */ single?: boolean }) {
  const cols = single ? "" : trainers.length === 1 ? "max-w-2xl" : trainers.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={`grid gap-5 ${cols} ${className}`}>
      {trainers.map((trainer, index) => (
        <Reveal as="li" key={trainer.id} from={FROM[index % 3]} delay={(index % 3) * 80} className="card-hover group flex gap-5 border border-line bg-ink-2 p-5 sm:p-6">
          <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gold/15 font-display text-2xl text-gold ring-1 ring-gold/40 sm:size-24">
            {trainer.photoUrl
              ? <Image src={trainer.photoUrl} alt={trainer.name} fill unoptimized={!trainer.photoUrl.startsWith("/pics/")} sizes="96px" className="object-cover transition duration-500 group-hover:scale-105" />
              : initials(trainer.name)}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-xl uppercase text-bone">{trainer.name}</h3>
            {trainer.title && <p className="mt-1 text-sm text-gold">{trainer.title}</p>}
            {trainer.bio && <p className="mt-3 text-sm leading-relaxed text-mist">{trainer.bio}</p>}
            {trainer.formations && trainer.formations.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {trainer.formations.map((f) => (
                  <li key={f.id}>
                    <Link href={formationHref(f)} className="inline-block border border-line px-3 py-1.5 text-xs text-mist transition-colors hover:border-gold hover:text-bone">{f.name}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
