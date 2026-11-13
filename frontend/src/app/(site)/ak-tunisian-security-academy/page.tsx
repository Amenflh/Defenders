import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "../contact/ContactForm";
import { FacebookVideoEmbed } from "@/components/FacebookVideoEmbed";
import { divisionCopy } from "@/lib/division-copy";
import { historyFor } from "@/lib/history";
import { getDictionary } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.pages.akAcademy.title,
    description: t.pages.akAcademy.metaDescription,
  };
}

export default async function AkTunisianSecurityAcademyPage() {
  const { locale, t } = await getDictionary();
  const S = t.pages.akAcademy;
  const experience = divisionCopy[locale].tsa;
  const contact = site.tunisianSecurityAcademy;

  return (
    <div className="branch-theme-tsa">
      <PageIntro eyebrow="Tunisian Security Academy · Hammamet" title={S.title}>
        {S.intro}
      </PageIntro>

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{S.aboutEyebrow}</p>
            <h2 className="heading-lg">{S.aboutTitle}</h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-mist">{S.aboutText}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <article className="border-s-2 border-gold bg-ink-2 p-5">
                <p className="eyebrow mb-2">{S.focusTitle}</p>
                <p className="text-sm leading-relaxed text-mist">{S.focusText}</p>
              </article>
              <article className="border-s-2 border-line bg-ink-2 p-5">
                <p className="eyebrow mb-2">{S.locationTitle}</p>
                <p className="text-sm leading-relaxed text-mist">{S.location}</p>
              </article>
            </div>
            <p className="mt-6 border-s-2 border-gold/50 ps-4 text-sm leading-relaxed text-mist">{S.sourceNote}</p>
          </Reveal>
          <Reveal delay={120} className="mx-auto w-full max-w-sm border border-line bg-[#f3f0e8] p-7 text-center shadow-2xl sm:p-9">
            <Image src="/pics/partners/TSA-logo.jpg" alt={S.logoAlt} width={280} height={280} priority className="mx-auto size-56 rounded-full object-contain" />
            <p className="mt-5 font-display text-sm tracking-[0.16em] text-ink uppercase">A.K Tunisian Security Academy</p>
          </Reveal>
        </div>
      </section>

      <section id="programme" className="border-y border-line bg-[#f3f0e8] py-16 text-ink lg:py-24">
        <div className="container-site">
          <Reveal className="mb-9 max-w-3xl">
            <p className="eyebrow mb-3">{S.courseEyebrow}</p>
            <h2 className="font-display text-3xl tracking-wide uppercase sm:text-4xl">{S.courseTitle}</h2>
            <p className="mt-4 leading-relaxed text-ink/70">{S.courseText}</p>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <Reveal className="border border-ink/10 bg-white p-6 sm:p-9">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
                <div>
                  <p className="eyebrow mb-2">{S.focusTitle}</p>
                  <h3 className="font-display text-2xl uppercase">{S.courseTitle}</h3>
                </div>
                <span className="border border-ink/20 px-3 py-2 font-display text-sm">{S.courseDuration}</span>
              </div>
              <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <div>
                  <ul className="grid gap-4 text-sm sm:grid-cols-2">
                    {S.courseTopics.map((topic, index) => (
                      <li key={topic} className="flex items-start gap-3 border-t border-ink/10 pt-4">
                        <span className="font-display text-xs text-gold">{String(index + 1).padStart(2, "0")}</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-7 border-s-2 border-gold ps-4 text-sm leading-relaxed text-ink/70">{S.coursePractical}</p>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <FacebookVideoEmbed url={contact.firstResponseVideoEmbed} title={S.courseTitle} />
                  <a href={contact.firstResponseVideo} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] text-ink uppercase hover:text-gold">
                    <Icon name="facebook" width={16} height={16} /> {S.courseSource}
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100} className="flex flex-col justify-between bg-ink p-7 text-bone sm:p-9">
              <div>
                <p className="eyebrow mb-3">{S.updatesEyebrow}</p>
                <h3 className="font-display text-2xl uppercase">{S.updatesTitle}</h3>
                <p className="mt-4 text-sm leading-relaxed text-mist">{S.updatesText}</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={contact.facebook} target="_blank" rel="noreferrer" className="btn btn-primary !px-4">
                  <Icon name="facebook" /> {S.profile}
                </a>
                <a href={contact.videos} target="_blank" rel="noreferrer" className="btn btn-ghost !px-4">
                  <Icon name="play" /> {S.videos}
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-6 border border-ink/10 bg-white p-6 sm:p-9">
            <p className="eyebrow mb-2">{S.k9CourseEyebrow}</p>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
              <h3 className="font-display text-2xl uppercase">{S.k9CourseTitle}</h3>
              <span className="border border-ink/20 px-3 py-2 font-display text-sm">{S.k9CourseDuration}</span>
            </div>
            <p className="mt-5 max-w-3xl leading-relaxed text-ink/70">{S.k9CourseText}</p>
            <ul className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              {S.k9CourseTopics.map((topic, index) => (
                <li key={topic} className="flex items-start gap-3 border-t border-ink/10 pt-4">
                  <span className="font-display text-xs text-gold">{String(index + 1).padStart(2, "0")}</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 border-s-2 border-gold ps-4 text-sm leading-relaxed text-ink/70">{S.k9CoursePractical}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <a href={contact.k9TrainingPost} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] text-ink uppercase hover:text-gold">
                <Icon name="facebook" width={16} height={16} /> {S.k9CourseSource}
              </a>
              <a href={contact.k9Contact.href} className="inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] text-ink uppercase hover:text-gold">
                <Icon name="phone" width={16} height={16} /> {S.k9CourseContact}: {contact.k9Contact.label}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="historique" className="scroll-mt-24 py-16 lg:py-20">
        <div className="container-site">
          <Reveal className="mb-9 max-w-3xl">
            <p className="eyebrow mb-3">{experience.historyEyebrow}</p>
            <h2 className="heading-lg">{experience.historyTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{experience.historyText}</p>
          </Reveal>
          <HistoryTimeline entries={historyFor("tsa")} />
        </div>
      </section>

      <section id="equipe-pedagogique" className="border-y border-line bg-ink-2 py-16 lg:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{S.trainersEyebrow}</p>
            <h2 className="heading-lg">{S.trainersTitle}</h2>
          </Reveal>
          <Reveal delay={100} className="border border-line bg-ink p-7 sm:p-9">
            <p className="leading-relaxed text-mist">{S.trainersText}</p>
          </Reveal>
        </div>
      </section>

      <section id="galerie" className="border-b border-line py-16 lg:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{experience.galleryEyebrow}</p>
            <h2 className="heading-lg">{experience.galleryTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{experience.noGalleryText}</p>
          </Reveal>
          <Reveal delay={100} className="flex min-h-56 flex-wrap items-center justify-center gap-3 border border-dashed border-line bg-ink-2 p-8">
            <a href={contact.facebook} target="_blank" rel="noreferrer" className="btn btn-primary">
              <Icon name="facebook" /> {S.profile}
            </a>
            <a href={contact.videos} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Icon name="play" /> {S.videos}
            </a>
          </Reveal>
        </div>
      </section>

      <section id="temoignages" className="scroll-mt-24 border-b border-line bg-ink-2 py-16 lg:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{experience.reviewsEyebrow}</p>
            <h2 className="heading-lg">{experience.reviewsTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{experience.reviewsText}</p>
          </Reveal>
          <Reveal delay={100} className="border border-line bg-ink p-7 sm:p-9">
            <p className="leading-relaxed text-mist">{experience.reviewsEmpty}</p>
          </Reveal>
        </div>
      </section>

      <section id="inscription" className="scroll-mt-24 py-16 lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <Reveal className="border border-line bg-ink-2 p-7 sm:p-9">
            <p className="eyebrow mb-3">{S.registrationEyebrow}</p>
            <h2 className="heading-lg">{S.registrationTitle}</h2>
            <p className="mt-5 leading-relaxed text-mist">{S.registrationText}</p>
            <div className="mt-8 space-y-4 border-t border-line pt-6 text-sm text-mist">
              <p>{contact.address.join(", ")}</p>
              <a href={contact.phone.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" />{contact.phone.label}</a>
              <a href={contact.trainingPhone.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" />{contact.trainingPhone.label}</a>
              <a href={contact.email.href} className="flex items-center gap-3 break-all hover:text-bone"><Icon name="mail" className="text-gold" />{contact.email.label}</a>
            </div>
          </Reveal>
          <Reveal delay={120} className="border border-line bg-ink-2 p-6 sm:p-9">
            <ContactForm variant="inquiry" inquiryCopy={S.registrationForm} />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-ink-2 py-10">
        <div className="container-site">
          <Link href="/#filieres" className="inline-flex items-center gap-2 font-display text-sm tracking-[0.12em] text-gold uppercase hover:text-bone">
            <Icon name="arrow" className="rtl:-scale-x-100" /> {S.backToGroup}
          </Link>
        </div>
      </section>
    </div>
  );
}
