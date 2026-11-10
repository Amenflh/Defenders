"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

/**
 * Texte officiel du règlement intérieur (version arabe signée, transcrite du PDF
 * public/pics/documents/reglement-interieur-defenders.pdf). Le PDF reste téléchargeable.
 */
const RULES: { n: number; text: string }[] = [
  { n: 1, text: "يهدف هذا النّظام إلى تحقيق الإنضباط والفعاليّة في عمليّة التّكوين، وضمان بيئة تعليميّة مناسبة للجميع." },
  { n: 2, text: "تشمل الدّورة التّكوينيّة الواحدة عدّة محاور للتّدريب في إطار حصص يوميّة." },
  { n: 3, text: "لقبول مشاركته بالدّورة، يشترط في المتدرّب أساسا أن يكون قد مارس الرّياضة لمدّة سنة واحدة دون إنقطاع على الأقلّ قبل مباشرة الدّورة التّكوينيّة. وفي حال تبيّن أنّه لا يتوفّر على الحدّ الأدنى من اللّياقة البدنيّة للقيام بالتّمارين الرّياضيّة المطلوبة منه، فإنّ مركز التّكوين \"DEFENDERS FITNESS ACADEMY\" يحتفظ بحقّه في عدم تمكين المتدرّب من الشّهادة في ختم الدّورة." },
  { n: 4, text: "يلتزم المتدرّب بإحترام القواعد الّتي تنظّم سير العمل وبتنفيذ جميع تعليمات المدرّبين دون ممانعة أو مماطلة منه طيلة فترة التّكوين." },
  { n: 5, text: "يحجّر على المتدرّب التغيّب دون ترخيص كتابيّ مسبق من طرف الممثّل القانوني للمركز فقط لا غير." },
  { n: 6, text: "لا يحقّ للمتدرّب المطالبة بشهادة في ختم التّكوين عن كلّ محور تغيّب عنه ولم يحضر بالحصص المخصّصة له." },
  { n: 7, text: "يقع التّشطيب آليّا على كلّ متدرّب يتغيّب بأكثر من عدد 02 محاور بالدّورة التّكوينيّة الواحدة." },
  { n: 8, text: "يحجّر على المتدرّب إستهلاك المواد الكحوليّة والتّدخين ومخالفة قواعد السّلوك الأخلاقي السّليم طيلة فترة التّكوين." },
  { n: 9, text: "يتحمّل المتدرّب لوحده جميع المسؤوليّات القانونيّة والإداريّة النّاتجة عن مخالفته لقواعد النّظام العامّ والأخلاق الحميدة طيلة فترة التّكوين." },
  { n: 10, text: "لا يكون مركز التّكوين \"DEFENDERS FITNESS ACADEMY\" محلّ أيّ مساءلة مهما كانت طبيعتها تبعا للتّصرفات الّتي قد تصدر عن المتدرّب دون علم أو مصادقة كتابيّة مسبقة من الممثّل القانوني." },
  { n: 11, text: "يُعدّ مركز التكوين «DEFENDERS FITNESS ACADEMY» مركز تكوين مستمر مرخّصًا من قبل وزارة التكوين المهني والتشغيل تحت عدد 21-340-24، ويقتصر نشاطه حصريًا على تقديم خدمات التكوين المستمر، وذلك طبقًا للتشريع الجاري به العمل ولمقتضيات كراس الشروط المنظّم لنشاط مراكز التكوين. وبموجب الأحكام القانونية الجاري بها العمل، يُمنع على مركز التكوين إبرام عقود عمل مباشرة، أو التوسّط في التشغيل، أو تقاضي أو تلقي أي مبالغ مالية مهما كان نوعها أو قدرها مقابل خدمات تتعلّق بالتشغيل. وفي هذا الإطار، تمّ إبرام اتفاقية شراكة بتاريخ 23 سبتمبر 2025 مع شركة رتاج للتوظيف، المتحصّلة على ترخيص قانوني صادر عن وزارة التكوين المهني والتشغيل تحت عدد 13/2014، باعتبارها الجهة المختصّة قانونًا للقيام بجميع أعمال التوظيف المنصوص عليها بالتشريع الجاري به العمل، وذلك باستقلالية تامّة ودون أي تدخّل أو تأثير مباشر أو غير مباشر من الأكاديمية." },
  { n: 12, text: "أي مخالفة لهذا النظام الدّاخلي تؤدّي آليا وجوبا إلى إلغاء حق المتدرّب في الحصول على شهادة في ختم الدّورة التّكوينيّة دون أن يكون لهذا الأخير الحق في المطالبة بأيّ تعويض مهما كانت طبيعته." },
];

/**
 * Lecture obligatoire du règlement intérieur avant une inscription :
 * 1. le candidat fait défiler le règlement jusqu'en bas ;
 * 2. il clique sur « Je confirme avoir lu le règlement » ;
 * 3. la case d'acceptation (envoyée sous le nom `rulesAccepted`) devient cochable.
 */
export function RulesAgreement({ defaultAccepted = false, error }: { defaultAccepted?: boolean; error?: string }) {
  const { t } = useI18n();
  const r = t.form.rules;
  const boxRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(defaultAccepted);
  const [confirmed, setConfirmed] = useState(defaultAccepted);
  const [accepted, setAccepted] = useState(defaultAccepted);

  const checkEnd = () => {
    const el = boxRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 12) setReachedEnd(true);
  };
  // Écran assez grand pour tout afficher sans défilement : la lecture est considérée comme atteinte.
  useEffect(checkEnd, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-mist">{r.intro}</p>

      <div className="border border-line bg-ink">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="font-display text-sm tracking-[0.08em] uppercase">{r.title}</p>
          <a href={site.documents.rules} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 text-xs text-gold hover:text-gold-soft">
            <Icon name="file" width={14} height={14} /> {r.download}
          </a>
        </div>
        <div
          ref={boxRef}
          onScroll={checkEnd}
          tabIndex={0}
          role="document"
          aria-label={r.title}
          dir="rtl"
          lang="ar"
          className="max-h-72 overflow-y-auto px-5 py-4 text-right font-[family-name:var(--font-cairo)] text-sm leading-loose text-bone/90 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        >
          <p className="mb-1 text-center font-semibold">النّظام الدّاخلي لمركز التّكوين</p>
          <p className="mb-4 text-center font-semibold" dir="ltr">&quot;DEFENDERS FITNESS ACADEMY&quot;</p>
          <ol className="space-y-3">
            {RULES.map((rule) => (
              <li key={rule.n}>
                <span className="font-semibold text-gold underline underline-offset-4">الفصل {rule.n}:</span> {rule.text}
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-line pt-4 text-center text-xs text-mist" dir="ltr">
            Defenders Security Protection · Defenders Fitness Academy · Tunisian Security Academy — Agrément n° 21-340-24
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!reachedEnd || confirmed}
          onClick={() => setConfirmed(true)}
          className="btn btn-primary !px-4 !py-2.5 !text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="check" width={16} height={16} /> {confirmed ? r.confirmed : r.confirm}
        </button>
        {!reachedEnd && <p className="text-xs text-mist">{r.scrollHint}</p>}
      </div>

      <label className={`flex items-start gap-3 text-sm ${confirmed ? "text-mist" : "cursor-not-allowed text-mist/50"}`}>
        <input
          type="checkbox"
          name="rulesAccepted"
          disabled={!confirmed}
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 size-4 accent-[var(--color-gold)]"
        />
        {r.checkbox}
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
