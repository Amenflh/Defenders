import type { Locale } from "./i18n/config";

type InternalRules = {
  title: string;
  description: string;
  intro: string;
  chapterLabel: string;
  clauses: readonly string[];
};

export const internalRules: Record<Locale, InternalRules> = {
  fr: {
    title: "Règlement intérieur des formations",
    description: "Règles applicables aux participants des formations de Defenders Academy.",
    intro: "Le présent règlement fixe les règles de discipline et les conditions applicables pendant les formations.",
    chapterLabel: "Article",
    clauses: [
      "Le présent règlement a pour objectif d'assurer la discipline et l'efficacité de la formation, ainsi que de garantir un environnement d'apprentissage adapté à tous.",
      "Chaque session de formation comprend plusieurs modules organisés sous forme de séances quotidiennes.",
      "Pour être admis à une session, le participant doit notamment avoir pratiqué une activité sportive sans interruption pendant au moins une année avant le début de la formation. Si son niveau de condition physique est insuffisant pour réaliser les exercices sportifs demandés, le centre de formation « DEFENDERS FITNESS ACADEMY » se réserve le droit de ne pas lui délivrer le certificat à la fin de la session.",
      "Le participant s'engage à respecter les règles de fonctionnement et à suivre toutes les instructions des formateurs, sans opposition ni retard, pendant toute la durée de la formation.",
      "Toute absence est interdite sans autorisation écrite préalable du seul représentant légal du centre.",
      "Le participant ne peut pas réclamer de certificat de fin de formation pour un module auquel il a été absent et dont il n'a pas suivi les séances.",
      "Tout participant absent à plus de deux modules d'une même session de formation est automatiquement exclu.",
      "La consommation d'alcool, le tabagisme et tout manquement aux règles de bonne conduite morale sont interdits pendant toute la durée de la formation.",
      "Le participant assume seul toute responsabilité juridique et administrative résultant de violations de l'ordre public ou des bonnes mœurs pendant la formation.",
      "Le centre de formation « DEFENDERS FITNESS ACADEMY » ne peut être tenu responsable, quelle qu'en soit la nature, des actes du participant qui n'ont pas été préalablement portés à sa connaissance ou approuvés par écrit par son représentant légal.",
      "Le centre « DEFENDERS FITNESS ACADEMY » est un établissement de formation continue agréé par le ministère de la Formation professionnelle et de l'Emploi sous le numéro 21-340-24. Son activité se limite exclusivement à la fourniture de services de formation continue, conformément à la législation en vigueur et au cahier des charges régissant les centres de formation. En vertu des dispositions légales applicables, le centre ne peut conclure directement des contrats de travail, faire de l'intermédiation en matière d'emploi, ni percevoir aucune somme, quelle qu'en soit la nature ou le montant, en contrepartie de services liés à l'emploi. À ce titre, une convention de partenariat a été conclue le 23 septembre 2025 avec la société de recrutement RITEJ, titulaire d'une autorisation légale délivrée par le ministère de la Formation professionnelle et de l'Emploi sous le numéro 13/2014. Cette société est légalement compétente pour réaliser, en toute indépendance et sans intervention ni influence directe ou indirecte de l'Académie, les opérations de recrutement prévues par la législation en vigueur.",
      "Toute violation du présent règlement entraîne automatiquement et obligatoirement la perte du droit du participant à obtenir un certificat à la fin de la session, sans qu'il puisse réclamer une quelconque indemnisation.",
    ],
  },
  en: {
    title: "Course internal rules",
    description: "Rules applicable to participants in Defenders Academy courses.",
    intro: "These rules set out the standards of conduct and conditions that apply during training.",
    chapterLabel: "Article",
    clauses: [
      "These rules aim to ensure discipline and effective training, and to provide an appropriate learning environment for everyone.",
      "Each training course consists of several modules delivered in daily sessions.",
      "To be admitted to a course, a participant must, in particular, have practised a sport continuously for at least one year before the course begins. If the participant does not have the minimum fitness required to perform the requested physical exercises, the training centre “DEFENDERS FITNESS ACADEMY” reserves the right to withhold the certificate at the end of the course.",
      "Participants must comply with the rules governing the course and follow all instructors’ directions without objection or delay throughout the training period.",
      "Participants may not be absent without prior written authorisation from the centre’s legal representative, who is the sole authority empowered to grant it.",
      "A participant may not claim a course-completion certificate for any module they missed and whose sessions they did not attend.",
      "Any participant who misses more than two modules in a single course is automatically dismissed from that course.",
      "Alcohol consumption, smoking and breaches of proper standards of conduct are prohibited throughout the training period.",
      "Participants alone bear all legal and administrative responsibility arising from any breach of public-order rules or standards of good conduct during training.",
      "The training centre “DEFENDERS FITNESS ACADEMY” shall not be held liable, on any grounds, for a participant’s conduct that was not previously brought to its attention or approved in writing by its legal representative.",
      "“DEFENDERS FITNESS ACADEMY” is a continuing-education centre licensed by the Ministry of Vocational Training and Employment under licence no. 21-340-24. Its activities are limited exclusively to providing continuing-education services, in accordance with applicable legislation and the specifications governing training centres. Under the applicable legal provisions, the centre may not enter into employment contracts directly, act as an employment intermediary, or receive any payment of any kind or amount for employment-related services. In this context, a partnership agreement was signed on 23 September 2025 with RITEJ, a recruitment company holding a legal licence issued by the Ministry of Vocational Training and Employment under no. 13/2014. RITEJ is the legally authorised entity for carrying out recruitment activities under applicable law, independently and without any direct or indirect intervention or influence by the Academy.",
      "Any breach of these rules automatically and necessarily cancels the participant’s right to receive a certificate at the end of the course, without entitlement to compensation of any kind.",
    ],
  },
  ar: {
    title: "النظام الداخلي للتكوينات",
    description: "القواعد المنطبقة على المشاركين في تكوينات Defenders Academy.",
    intro: "يحدّد هذا النظام قواعد الانضباط والشروط المنطبقة طوال فترة التكوين.",
    chapterLabel: "الفصل",
    clauses: [
      "يهدف هذا النّظام إلى تحقيق الإنضباط والفعاليّة في عمليّة التّكوين، وضمان بيئة تعليميّة مناسبة للجميع.",
      "تشمل الدّورة التّكوينيّة الواحدة عدّة محاور للتّدريب في إطار حصص يوميّة.",
      "لقبول مشاركته بالدّورة، يشترط في المتدرّب أساسا أن يكون قد مارس الرّياضة لمدّة سنة واحدة دون إنقطاع على الأقلّ قبل مباشرة الدّورة التّكوينيّة. وفي حال تبيّن أنّه لا يتوفّر على الحدّ الأدنى من اللّياقة البدنيّة للقيام بالتّمارين الرّياضيّة المطلوبة منه، فإنّ مركز التّكوين \"DEFENDERS FITNESS ACADEMY\" يحتفظ بحقّه في عدم تمكين المتدرّب من الشّهادة في ختم الدّورة.",
      "يلتزم المتدرّب بإحترام القواعد الّتي تنظّم سير العمل وبتنفيذ جميع تعليمات المدرّبين دون ممانعة أو مماطلة منه طيلة فترة التّكوين.",
      "يحجّر على المتدرّب التغيّب دون ترخيص كتابيّ مسبق من طرف الممثّل القانوني للمركز فقط لا غير.",
      "لا يحقّ للمتدرّب المطالبة بشهادة في ختم التّكوين عن كلّ محور تغيّب عنه ولم يحضر بالحصص المخصّصة له.",
      "يقع التّشطيب آليّا على كلّ متدرّب يتغيّب بأكثر من عدد 02 محاور بالدّورة التّكوينيّة الواحدة.",
      "يحجّر على المتدرّب إستهلاك المواد الكحوليّة والتّدخين ومخالفة قواعد السّلوك الأخلاقي السّليم طيلة فترة التّكوين.",
      "يتحمّل المتدرّب لوحده جميع المسؤوليّات القانونيّة والإداريّة النّاتجة عن مخالفته لقواعد النّظام العامّ والأخلاق الحميدة طيلة فترة التّكوين.",
      "لا يكون مركز التّكوين \"DEFENDERS FITNESS ACADEMY\" محلّ أيّ مساءلة مهما كانت طبيعتها تبعا للتّصرفات الّتي قد تصدر عن المتدرّب دون علم أو مصادقة كتابيّة مسبقة من الممثّل القانوني.",
      "يُعدّ مركز التكوين «DEFENDERS FITNESS ACADEMY» مركز تكوين مستمر مرخّصًا من قبل وزارة التكوين المهني والتشغيل تحت عدد 21-340-24، ويقتصر نشاطه حصريًا على تقديم خدمات التكوين المستمر، وذلك طبقًا للتشريع الجاري به العمل ولمقتضيات كراس الشروط المنظّم لنشاط مراكز التكوين. وبموجب الأحكام القانونية الجاري بها العمل، يُمنع على مركز التكوين إبرام عقود عمل مباشرة، أو التوسّط في التشغيل، أو تقاضي أو تلقي أي مبالغ مالية مهما كان نوعها أو قدرها مقابل خدمات تتعلّق بالتشغيل. وفي هذا الإطار، تمّ إبرام اتفاقية شراكة بتاريخ 23 سبتمبر 2025 مع شركة رتاج للتوظيف، المتحصّلة على ترخيص قانوني صادر عن وزارة التكوين المهني والتشغيل تحت عدد 13/2014، باعتبارها الجهة المختصّة قانونًا للقيام بجميع أعمال التوظيف المنصوص عليها بالتشريع الجاري به العمل، وذلك باستقلالية تامّة ودون أي تدخّل أو تأثير مباشر أو غير مباشر من الأكاديمية.",
      "أي مخالفة لهذا النظام الدّاخلي تؤدّي آليا وجوبا إلى إلغاء حق المتدرّب في الحصول على شهادة في ختم الدّورة التّكوينيّة دون أن يكون لهذا الأخير الحق في المطالبة بأيّ تعويض مهما كانت طبيعته.",
    ],
  },
};
