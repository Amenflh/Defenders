import type { Locale } from "./i18n/config";
import type { HistoryActivity } from "./history";
import { site } from "./site";

export type DivisionKey = "fitness" | "security" | "tsa";

type DivisionCopy = {
  galleryEyebrow: string;
  galleryTitle: string;
  galleryText: string;
  noGalleryText: string;
  historyEyebrow: string;
  historyTitle: string;
  historyText: string;
  reviewsEyebrow: string;
  reviewsTitle: string;
  reviewsText: string;
  reviewsEmpty: string;
  sourceLinks: { label: string; href: string }[];
};

export const divisionActivities: Record<DivisionKey, readonly HistoryActivity[]> = {
  fitness: ["pilates", "football", "personal-training"],
  security: ["securite"],
  tsa: ["tsa"],
};

export const divisionCopy: Record<Locale, Record<DivisionKey, DivisionCopy>> = {
  fr: {
    fitness: {
      galleryEyebrow: "Médias de la filière",
      galleryTitle: "Dans les studios et sur le terrain",
      galleryText: "Les photos Pilates ci-dessous proviennent des médias de l'académie. Pour les autres disciplines, consultez les publications originales afin de voir les contenus les plus récents.",
      noGalleryText: "Aucune photo ou vidéo DSP n'a été vérifiée pour une republication sur ce site. Les liens ouvrent les sources officielles et leurs archives.",
      historyEyebrow: "Archives",
      historyTitle: "Programmes de formation répertoriés",
      historyText: "Les informations proviennent des publications sources. La date d'un post n'est pas celle d'une session et ne confirme pas sa réalisation.",
      reviewsEyebrow: "Retours des stagiaires",
      reviewsTitle: "Témoignages vérifiés",
      reviewsText: "Les avis sont publiés uniquement lorsqu'ils sont vérifiables et autorisés par les personnes concernées.",
      reviewsEmpty: "Aucun témoignage public vérifiable n'a été confirmé. Les avis Facebook consultés n'affichent pas encore de note.",
      sourceLinks: [
        { label: "Page Facebook", href: site.facebook.href },
        { label: "Compte Instagram", href: site.instagram.href },
        { label: "Vidéos Facebook", href: site.facebook.videos },
      ],
    },
    security: {
      galleryEyebrow: "Médias de la filière",
      galleryTitle: "Publications et sources DSP",
      galleryText: "Retrouvez les informations et publications accessibles par le portail de Defenders Security Protection.",
      noGalleryText: "Aucune galerie photo DSP authentifiée n'a été confirmée dans les sources consultées. Nous préférons ne pas remplacer ces contenus par des photos génériques.",
      historyEyebrow: "Archives",
      historyTitle: "Formations de sécurité",
      historyText: "Seules les formations documentées par une source sont répertoriées ici.",
      reviewsEyebrow: "Retours des stagiaires",
      reviewsTitle: "Témoignages vérifiés",
      reviewsText: "Les avis sont publiés uniquement lorsqu'ils sont vérifiables et autorisés par les personnes concernées.",
      reviewsEmpty: "Aucun témoignage public vérifiable n'a été confirmé pour cette filière.",
      sourceLinks: [
        { label: "Portail DSP", href: site.securityPortal },
        { label: "Source officielle TSA", href: site.tunisianSecurityAcademy.facebook },
      ],
    },
    tsa: {
      galleryEyebrow: "Médias de la filière",
      galleryTitle: "Publications de Tunisian Security Academy",
      galleryText: "Consultez les publications et vidéos directement auprès de la page officielle de l'académie.",
      noGalleryText: "Les médias restent sur les pages officielles afin de conserver leur contexte et leurs dates de publication.",
      historyEyebrow: "Archives",
      historyTitle: "Programmes de formation",
      historyText: "Les informations proviennent des publications sources. La date d'un post n'est pas celle d'une session et ne confirme pas sa réalisation.",
      reviewsEyebrow: "Retours des stagiaires",
      reviewsTitle: "Témoignages vérifiés",
      reviewsText: "Les avis sont publiés uniquement lorsqu'ils sont vérifiables et autorisés par les personnes concernées.",
      reviewsEmpty: "Aucun témoignage public vérifiable n'a été confirmé. La page Facebook consultée n'affiche pas encore de note.",
      sourceLinks: [
        { label: "Page Facebook officielle", href: site.tunisianSecurityAcademy.facebook },
        { label: "Vidéos officielles", href: site.tunisianSecurityAcademy.videos },
      ],
    },
  },
  en: {
    fitness: {
      galleryEyebrow: "Division media",
      galleryTitle: "In the studio and on the field",
      galleryText: "The Pilates photos below come from the academy's media. For other disciplines, visit the original posts for the latest content.",
      noGalleryText: "No DSP photo or video has been verified for republication on this site. Links open the official sources and their archives.",
      historyEyebrow: "Archive",
      historyTitle: "Listed course programmes",
      historyText: "These details come from source posts. A post date is not a session date and does not confirm delivery.",
      reviewsEyebrow: "Trainee feedback",
      reviewsTitle: "Verified testimonials",
      reviewsText: "Testimonials are published only when verifiable and authorised by the people concerned.",
      reviewsEmpty: "No verifiable public testimonial has been confirmed. The Facebook reviews checked do not yet show a rating.",
      sourceLinks: [
        { label: "Facebook page", href: site.facebook.href },
        { label: "Instagram account", href: site.instagram.href },
        { label: "Facebook videos", href: site.facebook.videos },
      ],
    },
    security: {
      galleryEyebrow: "Division media",
      galleryTitle: "DSP publications and sources",
      galleryText: "Find information and publications available through the Defenders Security Protection portal.",
      noGalleryText: "No authenticated DSP photo gallery was confirmed in the sources reviewed. We will not replace it with generic photos.",
      historyEyebrow: "Archive",
      historyTitle: "Security training courses",
      historyText: "Only source-backed training programmes are listed here.",
      reviewsEyebrow: "Trainee feedback",
      reviewsTitle: "Verified testimonials",
      reviewsText: "Testimonials are published only when verifiable and authorised by the people concerned.",
      reviewsEmpty: "No verifiable public testimonial has been confirmed for this division.",
      sourceLinks: [
        { label: "DSP portal", href: site.securityPortal },
        { label: "Official TSA source", href: site.tunisianSecurityAcademy.facebook },
      ],
    },
    tsa: {
      galleryEyebrow: "Division media",
      galleryTitle: "Tunisian Security Academy posts",
      galleryText: "See posts and videos directly on the academy's official page.",
      noGalleryText: "Media remain on the official pages to preserve their original context and publication dates.",
      historyEyebrow: "Archive",
      historyTitle: "Course programmes",
      historyText: "These details come from source posts. A post date is not a session date and does not confirm delivery.",
      reviewsEyebrow: "Trainee feedback",
      reviewsTitle: "Verified testimonials",
      reviewsText: "Testimonials are published only when verifiable and authorised by the people concerned.",
      reviewsEmpty: "No verifiable public testimonial has been confirmed. The Facebook page checked does not yet show a rating.",
      sourceLinks: [
        { label: "Official Facebook page", href: site.tunisianSecurityAcademy.facebook },
        { label: "Official videos", href: site.tunisianSecurityAcademy.videos },
      ],
    },
  },
  ar: {
    fitness: {
      galleryEyebrow: "وسائط الفرع",
      galleryTitle: "في الاستوديو وعلى الميدان",
      galleryText: "صور البيلاتس أدناه من وسائط الأكاديمية. للاطلاع على أحدث محتوى الاختصاصات الأخرى، راجع المنشورات الأصلية.",
      noGalleryText: "لم يتم التثبت من صور أو فيديوهات DSP لإعادة نشرها على هذا الموقع. تفتح الروابط المصادر الرسمية وأرشيفاتها.",
      historyEyebrow: "الأرشيف",
      historyTitle: "برامج التكوين المدرجة",
      historyText: "تستند المعلومات إلى المنشورات المصدرية. تاريخ المنشور ليس موعد الدورة ولا يؤكد انعقادها.",
      reviewsEyebrow: "آراء المتكوّنين",
      reviewsTitle: "شهادات موثقة",
      reviewsText: "لا تُنشر الشهادات إلا بعد التثبت منها والحصول على موافقة أصحابها.",
      reviewsEmpty: "لم يتم تأكيد أي شهادة علنية قابلة للتحقق. لا تعرض مراجعات فيسبوك التي اطلعنا عليها تقييمًا بعد.",
      sourceLinks: [
        { label: "صفحة فيسبوك", href: site.facebook.href },
        { label: "حساب إنستغرام", href: site.instagram.href },
        { label: "فيديوهات فيسبوك", href: site.facebook.videos },
      ],
    },
    security: {
      galleryEyebrow: "وسائط الفرع",
      galleryTitle: "منشورات ومصادر DSP",
      galleryText: "اطّلع على المعلومات والمنشورات المتاحة عبر بوابة Defenders Security Protection.",
      noGalleryText: "لم يتم التثبت من معرض صور أصلي خاص بـ DSP ضمن المصادر التي تمت مراجعتها. لذلك لن نستعمل صورًا عامة بديلة.",
      historyEyebrow: "الأرشيف",
      historyTitle: "تكوينات الأمن",
      historyText: "تُدرج هنا برامج التكوين التي تستند إلى مصادر موثقة فقط.",
      reviewsEyebrow: "آراء المتكوّنين",
      reviewsTitle: "شهادات موثقة",
      reviewsText: "لا تُنشر الشهادات إلا بعد التثبت منها والحصول على موافقة أصحابها.",
      reviewsEmpty: "لم يتم تأكيد أي شهادة علنية قابلة للتحقق لهذا الفرع.",
      sourceLinks: [
        { label: "بوابة DSP", href: site.securityPortal },
        { label: "المصدر الرسمي لـ TSA", href: site.tunisianSecurityAcademy.facebook },
      ],
    },
    tsa: {
      galleryEyebrow: "وسائط الفرع",
      galleryTitle: "منشورات Tunisian Security Academy",
      galleryText: "شاهد المنشورات والفيديوهات مباشرة على الصفحة الرسمية للأكاديمية.",
      noGalleryText: "تبقى الوسائط في الصفحات الرسمية للمحافظة على سياقها وتواريخ نشرها.",
      historyEyebrow: "الأرشيف",
      historyTitle: "برامج التكوين",
      historyText: "تستند المعلومات إلى المنشورات المصدرية. تاريخ المنشور ليس موعد الدورة ولا يؤكد انعقادها.",
      reviewsEyebrow: "آراء المتكوّنين",
      reviewsTitle: "شهادات موثقة",
      reviewsText: "لا تُنشر الشهادات إلا بعد التثبت منها والحصول على موافقة أصحابها.",
      reviewsEmpty: "لم يتم تأكيد أي شهادة علنية قابلة للتحقق. لا تعرض صفحة فيسبوك التي اطلعنا عليها تقييمًا بعد.",
      sourceLinks: [
        { label: "صفحة فيسبوك الرسمية", href: site.tunisianSecurityAcademy.facebook },
        { label: "الفيديوهات الرسمية", href: site.tunisianSecurityAcademy.videos },
      ],
    },
  },
};
