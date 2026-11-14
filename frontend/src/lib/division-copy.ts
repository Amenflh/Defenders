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
      galleryText: "Plongez dans l'ambiance de nos formations Pilates. Retrouvez toutes nos disciplines en photos et en vidéos sur nos réseaux officiels.",
      noGalleryText: "Retrouvez nos photos et nos vidéos de formation sur nos pages officielles.",
      historyEyebrow: "Archives",
      historyTitle: "Programmes de formation répertoriés",
      historyText: "Retrouvez les formations organisées par l'académie au fil des sessions.",
      reviewsEyebrow: "Retours des stagiaires",
      reviewsTitle: "Ils ont suivi nos formations",
      reviewsText: "Découvrez les retours de nos stagiaires sur leur expérience de formation.",
      reviewsEmpty: "Vous avez suivi l'une de nos formations ? Partagez votre expérience avec nous : votre témoignage pourra être publié ici avec votre accord.",
      sourceLinks: [
        { label: "Page Facebook", href: site.facebook.href },
        { label: "Compte Instagram", href: site.instagram.href },
        { label: "Vidéos Facebook", href: site.facebook.videos },
      ],
    },
    security: {
      galleryEyebrow: "Médias de la filière",
      galleryTitle: "Publications et sources DSP",
      galleryText: "Retrouvez nos publications, nos actualités et nos contacts sur le portail Defenders Security Protection.",
      noGalleryText: "Les photos et vidéos de nos missions et de nos formations sont publiées sur nos canaux officiels.",
      historyEyebrow: "Archives",
      historyTitle: "Formations de sécurité",
      historyText: "Retrouvez les formations de sécurité organisées au fil des sessions.",
      reviewsEyebrow: "Retours des stagiaires",
      reviewsTitle: "Ils nous ont fait confiance",
      reviewsText: "Découvrez les retours de nos stagiaires et de nos clients.",
      reviewsEmpty: "Vous avez suivi l'une de nos formations ou fait appel à nos services ? Partagez votre expérience : votre témoignage pourra être publié ici avec votre accord.",
      sourceLinks: [
        { label: "Portail DSP", href: site.securityPortal },
        { label: "Source officielle TSA", href: site.tunisianSecurityAcademy.facebook },
      ],
    },
    tsa: {
      galleryEyebrow: "Médias de la filière",
      galleryTitle: "Publications de Tunisian Security Academy",
      galleryText: "Consultez les publications et vidéos directement auprès de la page officielle de l'académie.",
      noGalleryText: "Retrouvez les photos et les vidéos de nos formations sur la page officielle de l'académie.",
      historyEyebrow: "Archives",
      historyTitle: "Programmes de formation",
      historyText: "Retrouvez les formations organisées par l'académie au fil des sessions.",
      reviewsEyebrow: "Retours des stagiaires",
      reviewsTitle: "Ils ont suivi nos formations",
      reviewsText: "Découvrez les retours de nos stagiaires sur leur expérience de formation.",
      reviewsEmpty: "Vous avez suivi l'une de nos formations ? Partagez votre expérience avec nous : votre témoignage pourra être publié ici avec votre accord.",
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
      galleryText: "Step into our Pilates courses. Find all our disciplines in photos and videos on our official channels.",
      noGalleryText: "Find our training photos and videos on our official pages.",
      historyEyebrow: "Archive",
      historyTitle: "Listed course programmes",
      historyText: "Browse the courses the academy has run, session after session.",
      reviewsEyebrow: "Trainee feedback",
      reviewsTitle: "They trained with us",
      reviewsText: "Read what our trainees say about their course.",
      reviewsEmpty: "Have you taken one of our courses? Share your experience with us: your testimonial may be published here with your consent.",
      sourceLinks: [
        { label: "Facebook page", href: site.facebook.href },
        { label: "Instagram account", href: site.instagram.href },
        { label: "Facebook videos", href: site.facebook.videos },
      ],
    },
    security: {
      galleryEyebrow: "Division media",
      galleryTitle: "DSP publications and sources",
      galleryText: "Find our posts, news and contacts on the Defenders Security Protection portal.",
      noGalleryText: "Photos and videos of our assignments and courses are published on our official channels.",
      historyEyebrow: "Archive",
      historyTitle: "Security training courses",
      historyText: "Browse the security courses run, session after session.",
      reviewsEyebrow: "Trainee feedback",
      reviewsTitle: "They trusted us",
      reviewsText: "Read feedback from our trainees and clients.",
      reviewsEmpty: "Have you taken one of our courses or used our services? Share your experience: your testimonial may be published here with your consent.",
      sourceLinks: [
        { label: "DSP portal", href: site.securityPortal },
        { label: "Official TSA source", href: site.tunisianSecurityAcademy.facebook },
      ],
    },
    tsa: {
      galleryEyebrow: "Division media",
      galleryTitle: "Tunisian Security Academy posts",
      galleryText: "See posts and videos directly on the academy's official page.",
      noGalleryText: "Find photos and videos of our courses on the academy's official page.",
      historyEyebrow: "Archive",
      historyTitle: "Course programmes",
      historyText: "Browse the courses the academy has run, session after session.",
      reviewsEyebrow: "Trainee feedback",
      reviewsTitle: "They trained with us",
      reviewsText: "Read what our trainees say about their course.",
      reviewsEmpty: "Have you taken one of our courses? Share your experience with us: your testimonial may be published here with your consent.",
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
      galleryText: "عِش أجواء تكويناتنا في البيلاتس. شاهد كل اختصاصاتنا بالصور والفيديو على قنواتنا الرسمية.",
      noGalleryText: "شاهد صور وفيديوهات تكويناتنا على صفحاتنا الرسمية.",
      historyEyebrow: "الأرشيف",
      historyTitle: "برامج التكوين المدرجة",
      historyText: "اكتشف التكوينات التي نظّمتها الأكاديمية عبر الدورات.",
      reviewsEyebrow: "آراء المتكوّنين",
      reviewsTitle: "تكوّنوا معنا",
      reviewsText: "اكتشف آراء متكوّنينا حول تجربتهم في التكوين.",
      reviewsEmpty: "هل تابعت أحد تكويناتنا؟ شاركنا تجربتك: يمكن نشر شهادتك هنا بعد موافقتك.",
      sourceLinks: [
        { label: "صفحة فيسبوك", href: site.facebook.href },
        { label: "حساب إنستغرام", href: site.instagram.href },
        { label: "فيديوهات فيسبوك", href: site.facebook.videos },
      ],
    },
    security: {
      galleryEyebrow: "وسائط الفرع",
      galleryTitle: "منشورات ومصادر DSP",
      galleryText: "اطّلع على منشوراتنا وأخبارنا ومعطيات الاتصال على بوابة Defenders Security Protection.",
      noGalleryText: "تُنشر صور وفيديوهات مهامنا وتكويناتنا على قنواتنا الرسمية.",
      historyEyebrow: "الأرشيف",
      historyTitle: "تكوينات الأمن",
      historyText: "اكتشف تكوينات الأمن المنظّمة عبر الدورات.",
      reviewsEyebrow: "آراء المتكوّنين",
      reviewsTitle: "وثقوا بنا",
      reviewsText: "اكتشف آراء متكوّنينا وحرفائنا.",
      reviewsEmpty: "هل تابعت أحد تكويناتنا أو استعنت بخدماتنا؟ شاركنا تجربتك: يمكن نشر شهادتك هنا بعد موافقتك.",
      sourceLinks: [
        { label: "بوابة DSP", href: site.securityPortal },
        { label: "المصدر الرسمي لـ TSA", href: site.tunisianSecurityAcademy.facebook },
      ],
    },
    tsa: {
      galleryEyebrow: "وسائط الفرع",
      galleryTitle: "منشورات Tunisian Security Academy",
      galleryText: "شاهد المنشورات والفيديوهات مباشرة على الصفحة الرسمية للأكاديمية.",
      noGalleryText: "شاهد صور وفيديوهات تكويناتنا على الصفحة الرسمية للأكاديمية.",
      historyEyebrow: "الأرشيف",
      historyTitle: "برامج التكوين",
      historyText: "اكتشف التكوينات التي نظّمتها الأكاديمية عبر الدورات.",
      reviewsEyebrow: "آراء المتكوّنين",
      reviewsTitle: "تكوّنوا معنا",
      reviewsText: "اكتشف آراء متكوّنينا حول تجربتهم في التكوين.",
      reviewsEmpty: "هل تابعت أحد تكويناتنا؟ شاركنا تجربتك: يمكن نشر شهادتك هنا بعد موافقتك.",
      sourceLinks: [
        { label: "صفحة فيسبوك الرسمية", href: site.tunisianSecurityAcademy.facebook },
        { label: "الفيديوهات الرسمية", href: site.tunisianSecurityAcademy.videos },
      ],
    },
  },
};
