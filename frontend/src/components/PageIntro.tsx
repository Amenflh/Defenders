import { Reveal } from "./Reveal";

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-36 pb-16 lg:pt-44 lg:pb-20">
      <div className="pointer-events-none absolute -top-40 left-1/3 size-[30rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="container-site">
        <Reveal>
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h1 className="heading-xl max-w-4xl">{title}</h1>
        </Reveal>
        {children && (
          <Reveal delay={120}>
            <div className="mt-6 max-w-2xl text-lg leading-relaxed text-mist">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
