import { HomeHeroVideo, type HeroClip } from "./HomeHeroVideo";
import { Reveal } from "./Reveal";

/**
 * En-tête de page. Avec `clips`, les vidéos de fond des en-têtes défilent derrière le titre,
 * sous un voile qui garde le texte lisible dans les deux thèmes.
 */
export function PageIntro({
  eyebrow,
  title,
  children,
  clips,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  clips?: HeroClip[];
}) {
  const withVideo = Boolean(clips?.length);
  return (
    <section className={`relative overflow-hidden border-b border-line ${withVideo ? "surface-dark isolate flex min-h-[60svh] items-end pt-36 pb-16 lg:pt-44 lg:pb-20" : "pt-36 pb-16 lg:pt-44 lg:pb-20"}`}>
      {withVideo ? (
        <>
          <HomeHeroVideo clips={clips} />
          <div className="absolute inset-0 -z-10 bg-ink/60" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 via-ink/45 to-ink" />
        </>
      ) : (
        <div className="pointer-events-none absolute -top-40 left-1/3 size-[30rem] rounded-full bg-gold/10 blur-3xl" />
      )}
      <div className="container-site">
        <Reveal from="left">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h1 className="heading-xl max-w-4xl">{title}</h1>
        </Reveal>
        {children && (
          <Reveal from="left" delay={120}>
            <div className={`mt-6 max-w-2xl text-lg leading-relaxed ${withVideo ? "text-bone/85" : "text-mist"}`}>{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
