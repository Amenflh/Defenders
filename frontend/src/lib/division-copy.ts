import type { Academy } from "./academies";
import type { Locale } from "./i18n/config";

/** Textes des rubriques Galerie et Témoignages de chaque académie (modifiables dans l'admin › Textes du site). */
export type DivisionCopy = Record<Academy, {
  galleryEyebrow: string;
  galleryTitle: string;
  galleryText: string;
  reviewsEyebrow: string;
  reviewsTitle: string;
  reviewsText: string;
  reviewsEmpty: string;
}>;

export const divisionCopy: Record<Locale, DivisionCopy> = {
  fr: {
    fitness: {
      galleryEyebrow: "Médias de la filière",
      galleryTitle: "Dans les studios et sur le terrain",
      galleryText: "Plongez dans l'ambiance de nos formations : Pilates en studio, football sur le terrain et coaching personnel en salle. Retrouvez plus de photos et de vidéos sur nos réseaux officiels.",
      reviewsEyebrow: "Retours des stagiaires",
      reviewsTitle: "Ils ont suivi nos formations",
      reviewsText: "Découvrez les retours de nos stagiaires sur leur expérience de formation.",
      reviewsEmpty: "Vous avez suivi l'une de nos formations ? Partagez votre expérience avec nous : votre témoignage pourra être publié ici avec votre accord."
    },
    tsa: {
      galleryEyebrow: "Médias de la filière",
      galleryTitle: "Tunisian Security Academy en images",
      galleryText: "Protection rapprochée, première intervention, travail canin et remises de certificats : découvrez nos formations en photos et en vidéos.",
      reviewsEyebrow: "Retours des stagiaires",
      reviewsTitle: "Ils ont suivi nos formations",
      reviewsText: "Découvrez les retours de nos stagiaires sur leur expérience de formation.",
      reviewsEmpty: "Vous avez suivi l'une de nos formations ? Partagez votre expérience avec nous : votre témoignage pourra être publié ici avec votre accord."
    }
  },
  en: {
    fitness: {
      galleryEyebrow: "Division media",
      galleryTitle: "In the studio and on the field",
      galleryText: "Step into our courses: Pilates in the studio, football on the pitch and personal coaching in the gym. Find more photos and videos on our official channels.",
      reviewsEyebrow: "Trainee feedback",
      reviewsTitle: "They trained with us",
      reviewsText: "Read what our trainees say about their course.",
      reviewsEmpty: "Have you taken one of our courses? Share your experience with us: your testimonial may be published here with your consent."
    },
    tsa: {
      galleryEyebrow: "Division media",
      galleryTitle: "Tunisian Security Academy in pictures",
      galleryText: "Close protection, first response, canine work and certificate ceremonies: discover our courses in photos and videos.",
      reviewsEyebrow: "Trainee feedback",
      reviewsTitle: "They trained with us",
      reviewsText: "Read what our trainees say about their course.",
      reviewsEmpty: "Have you taken one of our courses? Share your experience with us: your testimonial may be published here with your consent."
    }
  },
  ar: {
    fitness: {
      galleryEyebrow: "وسائط الفرع",
      galleryTitle: "في الاستوديو وعلى الميدان",
      galleryText: "عِش أجواء تكويناتنا: البيلاتس في الاستوديو، كرة القدم في الملعب والتدريب الشخصي في القاعة. شاهد المزيد من الصور والفيديوهات على قنواتنا الرسمية.",
      reviewsEyebrow: "آراء المتكوّنين",
      reviewsTitle: "تكوّنوا معنا",
      reviewsText: "اكتشف آراء متكوّنينا حول تجربتهم في التكوين.",
      reviewsEmpty: "هل تابعت أحد تكويناتنا؟ شاركنا تجربتك: يمكن نشر شهادتك هنا بعد موافقتك."
    },
    tsa: {
      galleryEyebrow: "وسائط الفرع",
      galleryTitle: "الأكاديمية التونسية للأمن بالصور",
      galleryText: "الحماية القريبة، التدخل الأولي، العمل مع الكلاب وتسليم الشهادات: اكتشف تكويناتنا بالصور والفيديوهات.",
      reviewsEyebrow: "آراء المتكوّنين",
      reviewsTitle: "تكوّنوا معنا",
      reviewsText: "اكتشف آراء متكوّنينا حول تجربتهم في التكوين.",
      reviewsEmpty: "هل تابعت أحد تكويناتنا؟ شاركنا تجربتك: يمكن نشر شهادتك هنا بعد موافقتك."
    }
  }
};
