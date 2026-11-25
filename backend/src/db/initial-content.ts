/**
 * Contenu initial repris des textes du site (français, anglais, arabe) : inséré une seule fois dans la base,
 * puis entièrement géré dans l'admin. Modifier ce fichier ne change pas un site déjà initialisé.
 */
export type LangText = { en: Record<string, unknown>; ar: Record<string, unknown> };

/** Compléments des formations Fitness existantes (champs encore vides uniquement). */
export const FITNESS_EXTRAS: Record<string, { location: string; practical: string; videos: unknown[]; translations: LangText }> = {
  "pilates": {
    "location": "Nabeul",
    "practical": "Parcours Matwork & Reformer, niveaux 1 et 2 : 40 heures de formation sur six jours à Nabeul, avec une certification remise à l'issue du programme. La formation ouvre aussi l'accès à des opportunités de travail à l'étranger avec nos partenaires recrutement.",
    "videos": [
      {
        "url": "https://www.facebook.com/reel/1380600687572791/",
        "title": "Pilates Matwork & Reformer · vidéo 1",
        "layout": "portrait"
      },
      {
        "url": "https://www.facebook.com/reel/2149688955939054/",
        "title": "Pilates Matwork & Reformer · vidéo 2",
        "layout": "portrait"
      }
    ],
    "translations": {
      "en": {
        "name": "Pilates",
        "headline": "Pilates Mat & Reformer Instructor Training",
        "summary": "Train in Matwork and Reformer, levels 1 and 2: 40 hours over six days in Nabeul, with a certificate awarded at the end of the course. Contact us to book your place in the next session.",
        "intro": [
          "Pilates is one of the most requested practices in studios and private coaching. Our course combines a scientific understanding of movement with teaching skills.",
          "You work on the mat and on the Reformer, focusing on alignment, breathing, core control and adapting exercises to different profiles."
        ],
        "objectives": [
          "Understand the fundamental principles of the Pilates method",
          "Analyse posture and movement through functional anatomy",
          "Teach the Mat and Reformer repertoire safely",
          "Adapt exercises for beginners, athletes and specific groups",
          "Design and lead one-to-one and group sessions"
        ],
        "modules": [
          {
            "title": "Anatomy & biomechanics",
            "text": "Spine, pelvis, shoulder girdle: the basics to analyse every movement."
          },
          {
            "title": "Core principles",
            "text": "Breathing, centring, control, precision, flow and concentration."
          },
          {
            "title": "Mat repertoire",
            "text": "Floor exercises, progressions, regressions, cues and corrections."
          },
          {
            "title": "Reformer",
            "text": "Settings, safety, sequences and use of the springs."
          },
          {
            "title": "Specific groups",
            "text": "Adaptations for back pain, pregnancy, seniors and athletes."
          },
          {
            "title": "Teaching & sessions",
            "text": "Build, pace and lead a professional session."
          }
        ],
        "audience": [
          "Fitness coaches who want to specialise",
          "Recent sports science graduates",
          "Wellness and rehabilitation professionals"
        ],
        "careers": [
          "Pilates studio instructor",
          "Private coach at home or online",
          "Instructor in gyms and wellness centres"
        ],
        "facts": [
          {
            "label": "Equipment",
            "value": "Mat & Reformer"
          },
          {
            "label": "Approach",
            "value": "Theory + practice"
          },
          {
            "label": "Validation",
            "value": "Certificate"
          }
        ],
        "practical": "Matwork & Reformer pathway, levels 1 and 2: 40 hours of training over six days in Nabeul, with a certificate awarded at the end of the programme. The course also opens access to job opportunities abroad through our recruitment partners."
      },
      "ar": {
        "name": "بيلاتس",
        "headline": "تكوين مدربي Pilates Mat وReformer",
        "summary": "تكوين Matwork وReformer، المستويان الأول والثاني: 40 ساعة خلال ستة أيام في نابل، مع شهادة تُسلَّم في نهاية التكوين. تواصل معنا لحجز مكانك في الدورة القادمة.",
        "intro": [
          "البيلاتس من أكثر الممارسات طلبًا في الاستوديوهات والتدريب الخاص. يجمع تكويننا بين الفهم العلمي للحركة والتحكم البيداغوجي.",
          "تعمل على البساط وعلى الريفورمر، مع التركيز على وضعية الجسم والتنفس والتحكم في الجذع وتكييف التمارين مع مختلف الملفات."
        ],
        "objectives": [
          "فهم المبادئ الأساسية لطريقة البيلاتس",
          "تحليل وضعية الجسم والحركة عبر التشريح الوظيفي",
          "تدريس تمارين البساط والريفورمر بأمان",
          "تكييف التمارين للمبتدئين والرياضيين والفئات الخاصة",
          "تصميم وتنشيط حصص فردية وجماعية"
        ],
        "modules": [
          {
            "title": "التشريح والميكانيكا الحيوية",
            "text": "العمود الفقري، الحوض، حزام الكتف: أسس تحليل كل حركة."
          },
          {
            "title": "المبادئ الأساسية",
            "text": "التنفس، التمركز، التحكم، الدقة، الانسيابية والتركيز."
          },
          {
            "title": "تمارين البساط",
            "text": "تمارين أرضية، تدرّج، تبسيط، توجيهات وتصحيحات."
          },
          {
            "title": "الريفورمر",
            "text": "الضبط، السلامة، تسلسل التمارين واستعمال النوابض."
          },
          {
            "title": "الفئات الخاصة",
            "text": "تكييفات لآلام الظهر، الحمل، كبار السن والرياضيين."
          },
          {
            "title": "البيداغوجيا والحصة",
            "text": "بناء حصة مهنية وتنظيم إيقاعها وتنشيطها."
          }
        ],
        "audience": [
          "مدربو رياضة يرغبون في التخصص",
          "خريجون جدد في علوم الرياضة",
          "محترفو الرفاه وإعادة التأهيل"
        ],
        "careers": [
          "مدرب بيلاتس في استوديو",
          "مدرب خاص في المنزل أو عن بعد",
          "مدرب في قاعات الرياضة ومراكز الرفاه"
        ],
        "facts": [
          {
            "label": "الأجهزة",
            "value": "بساط وريفورمر"
          },
          {
            "label": "المنهج",
            "value": "نظري + تطبيقي"
          },
          {
            "label": "المصادقة",
            "value": "شهادة"
          }
        ],
        "practical": "مسار Matwork وReformer، المستويان الأول والثاني: 40 ساعة تكوين على ستة أيام في نابل، مع شهادة تُسلَّم في نهاية البرنامج. كما يفتح التكوين المجال لفرص عمل بالخارج عبر شركائنا في الانتداب."
      }
    }
  },
  "football": {
    "location": "Hammamet",
    "practical": "Quatre jours de formation pour entraîneurs de football à Hammamet : théorie et pratique, compétences fondamentales, séances inspirées de la méthode anglaise, analyse du jeu et méthodes d'entraînement. Deux certificats sont délivrés (coaching football et premiers secours sportifs / RCP). Pension complète avec trois repas par jour. Tarif : 750 TND. Renseignements : +216 29 039 493 · +216 92 204 005.",
    "videos": [
      {
        "url": "https://www.facebook.com/reel/1818481708830444/",
        "title": "Coaching football · vidéo",
        "layout": "portrait"
      }
    ],
    "translations": {
      "en": {
        "name": "Football",
        "headline": "Football Coaching and Training Course",
        "summary": "Four days of theory and practice in Hammamet: coaching methods, physical preparation, game analysis and session delivery. Two certificates awarded, full board included, 750 TND fee.",
        "intro": [
          "Coaching means passing on a method. Our course covers planning, physical preparation, tactics and management.",
          "The programme alternates theory and practical scenarios, with ready-to-use sessions."
        ],
        "objectives": [
          "Plan a season, a cycle and a session",
          "Develop football-specific physical qualities",
          "Teach game principles and tactical organisation",
          "Coach youth categories",
          "Manage a group, communication and motivation"
        ],
        "modules": [
          {
            "title": "Methodology",
            "text": "Objectives, content and progression of a session."
          },
          {
            "title": "Physical preparation",
            "text": "Endurance, speed, strength and injury prevention."
          },
          {
            "title": "Tactics & game principles",
            "text": "Collective organisation, transitions and game management."
          },
          {
            "title": "Youth categories",
            "text": "Developing young players, small-sided games and technical learning."
          },
          {
            "title": "Analysis & video",
            "text": "Watch a match and define areas to work on."
          },
          {
            "title": "Management",
            "text": "Leadership, communication and dressing-room management."
          }
        ],
        "audience": [
          "Working coaches and educators",
          "Experienced athletes (2+ years)",
          "Sports science graduates"
        ],
        "careers": [
          "Club coach or educator",
          "Football physical trainer",
          "Opportunities abroad with our partner RITEJ"
        ],
        "facts": [
          {
            "label": "Duration",
            "value": "4 intensive days"
          },
          {
            "label": "Accommodation",
            "value": "Full board"
          },
          {
            "label": "Validation",
            "value": "2 certificates"
          }
        ],
        "practical": "A four-day course for football coaches in Hammamet: theory and practice, core skills, sessions inspired by the English method, game analysis and coaching methods. Two certificates are awarded (football coaching and sports first aid / CPR). Full board with three meals a day. Fee: 750 TND. Information: +216 29 039 493 · +216 92 204 005."
      },
      "ar": {
        "name": "كرة القدم",
        "headline": "تكوين في تدريب كرة القدم والإعداد",
        "summary": "أربعة أيام من النظري والتطبيقي في الحمامات: منهجية التدريب، الإعداد البدني، تحليل اللعب وإدارة الحصص. تُسلَّم شهادتان، مع إقامة كاملة، بسعر 750 دينارًا.",
        "intro": [
          "التدريب هو نقل منهجية. يشمل تكويننا التخطيط والإعداد البدني والتكتيك والتسيير.",
          "يتناوب البرنامج بين الدروس النظرية والوضعيات التطبيقية، مع حصص جاهزة للاستعمال."
        ],
        "objectives": [
          "تخطيط موسم ودورة وحصة تدريبية",
          "تطوير الصفات البدنية الخاصة بكرة القدم",
          "نقل مبادئ اللعب والتنظيم التكتيكي",
          "تأطير الفئات الشابة",
          "تسيير المجموعة والتواصل والتحفيز"
        ],
        "modules": [
          {
            "title": "المنهجية",
            "text": "أهداف الحصة ومحتواها وتدرّجها."
          },
          {
            "title": "الإعداد البدني",
            "text": "التحمل، السرعة، القوة والوقاية من الإصابات."
          },
          {
            "title": "التكتيك ومبادئ اللعب",
            "text": "التنظيم الجماعي، التحولات وتنشيط اللعب."
          },
          {
            "title": "الفئات الشابة",
            "text": "تكوين اللاعب الشاب، الألعاب المصغرة والتعلم التقني."
          },
          {
            "title": "التحليل والفيديو",
            "text": "ملاحظة مباراة وتحديد محاور العمل."
          },
          {
            "title": "التسيير",
            "text": "القيادة، التواصل وتسيير غرفة الملابس."
          }
        ],
        "audience": [
          "مربّون ومدربون ناشطون",
          "رياضيون ذوو خبرة (أكثر من سنتين)",
          "خريجو علوم الرياضة"
        ],
        "careers": [
          "مدرب أو مربٍّ في نادٍ",
          "معدّ بدني في كرة القدم",
          "فرص في الخارج مع شريكنا رتاج"
        ],
        "facts": [
          {
            "label": "المدة",
            "value": "4 أيام مكثفة"
          },
          {
            "label": "الإقامة",
            "value": "إقامة كاملة"
          },
          {
            "label": "المصادقة",
            "value": "شهادتان"
          }
        ],
        "practical": "تكوين لمدة أربعة أيام لمدربي كرة القدم في الحمامات: نظري وتطبيقي، المهارات الأساسية، حصص مستوحاة من المنهج الإنجليزي، تحليل اللعب وطرق التدريب. تُسلَّم شهادتان (تدريب كرة القدم والإسعافات الأولية الرياضية / الإنعاش القلبي الرئوي). إقامة كاملة مع ثلاث وجبات يوميًا. السعر: 750 دينارًا. للاستفسار: ‎+216 29 039 493 · ‎+216 92 204 005."
      }
    }
  },
  "personal-training": {
    "location": "",
    "practical": "Évaluation du client, conception des programmes, technique de musculation en toute sécurité, nutrition et accompagnement : le programme couvre l'ensemble du métier de coach personnel. Contactez-nous pour connaître les dates et le lieu de la prochaine session.",
    "videos": [
      {
        "url": "https://www.facebook.com/reel/877141621507702/",
        "title": "Personal Training · vidéo 1",
        "layout": "portrait"
      },
      {
        "url": "https://www.facebook.com/reel/3279150018914978/",
        "title": "Personal Training · vidéo 2",
        "layout": "portrait"
      },
      {
        "url": "https://www.facebook.com/reel/796475196712099/",
        "title": "Personal Training · vidéo 3",
        "layout": "portrait"
      }
    ],
    "translations": {
      "en": {
        "name": "Personal Training",
        "headline": "Personal Sports Coaching Course",
        "summary": "Assess your clients' goals, plan their sessions and coach strength training, conditioning and nutrition basics. Contact us for the dates and venue of the next session.",
        "intro": [
          "Private coaching requires solid expertise and a real client relationship. The certification gives you the scientific and practical tools to design effective and safe programmes.",
          "An intensive course led by experienced trainers, with career support through our partner network."
        ],
        "objectives": [
          "Assess a client's fitness and goals",
          "Programme training: strength, hypertrophy, weight loss, performance",
          "Master strength-training technique and safety",
          "Give nutrition advice grounded in sports science",
          "Grow your private coaching business"
        ],
        "modules": [
          {
            "title": "Exercise physiology",
            "text": "Energy systems, adaptations and recovery."
          },
          {
            "title": "Strength training",
            "text": "Technique of fundamental lifts, loads and safety."
          },
          {
            "title": "Programming",
            "text": "Periodisation, progression and tracking results."
          },
          {
            "title": "Nutrition",
            "text": "Needs, body composition and eating habits."
          },
          {
            "title": "Client assessment",
            "text": "Tests, health history and measurable goals."
          },
          {
            "title": "Coaching business",
            "text": "Client relations, offer, pricing and retention."
          }
        ],
        "audience": [
          "Fitness enthusiasts who want to become coaches",
          "Coaches seeking a recognised certification",
          "Sports science graduates"
        ],
        "careers": [
          "Freelance personal trainer",
          "Gym coach",
          "Contract opportunities abroad with RITEJ"
        ],
        "facts": [
          {
            "label": "Duration",
            "value": "4 consecutive days"
          },
          {
            "label": "Certificates",
            "value": "7 certificates"
          },
          {
            "label": "Accommodation",
            "value": "Included"
          }
        ],
        "practical": "Client assessment, programme design, safe strength-training technique, nutrition and client support: the programme covers the whole personal-trainer profession. Contact us for the dates and venue of the next session."
      },
      "ar": {
        "name": "التدريب الشخصي",
        "headline": "تكوين في التدريب الرياضي الشخصي",
        "summary": "قيّم أهداف حرفائك، وبرمج حصصهم، وأطّر تمارين القوة واللياقة البدنية وأسس التغذية. تواصل معنا لمعرفة موعد ومكان الدورة القادمة.",
        "intro": [
          "يتطلب التدريب الخاص خبرة متينة وعلاقة حقيقية مع الحريف. تمنحك الشهادة الأدوات العلمية والعملية لتصميم برامج فعالة وآمنة.",
          "تكوين مكثف يؤطره مدربون ذوو خبرة، مع مرافقة نحو التشغيل عبر شبكة شركائنا."
        ],
        "objectives": [
          "تقييم اللياقة البدنية للحريف وأهدافه",
          "برمجة التدريب: القوة، تضخيم العضلات، إنقاص الوزن، الأداء",
          "إتقان تقنيات تقوية العضلات وقواعد السلامة",
          "تقديم نصائح غذائية مبنية على علوم الرياضة",
          "تطوير نشاطك كمدرب خاص"
        ],
        "modules": [
          {
            "title": "فيزيولوجيا الجهد",
            "text": "مصادر الطاقة، التكيّفات والاسترجاع."
          },
          {
            "title": "تقوية العضلات",
            "text": "تقنيات الحركات الأساسية، الأحمال والسلامة."
          },
          {
            "title": "البرمجة",
            "text": "التخطيط الدوري، التدرّج ومتابعة النتائج."
          },
          {
            "title": "التغذية",
            "text": "الاحتياجات، تركيبة الجسم والعادات الغذائية."
          },
          {
            "title": "تقييم الحريف",
            "text": "الاختبارات، السوابق الصحية وأهداف قابلة للقياس."
          },
          {
            "title": "إدارة نشاط التدريب",
            "text": "العلاقة مع الحريف، العرض، التسعير والولاء."
          }
        ],
        "audience": [
          "شغوفون باللياقة يرغبون في أن يصبحوا مدربين",
          "مدربون يبحثون عن شهادة معترف بها",
          "خريجو علوم الرياضة"
        ],
        "careers": [
          "مدرب شخصي مستقل",
          "مدرب في قاعة رياضة",
          "فرص عقود في الخارج مع رتاج"
        ],
        "facts": [
          {
            "label": "المدة",
            "value": "4 أيام متتالية"
          },
          {
            "label": "الشهادات",
            "value": "7 شهادات"
          },
          {
            "label": "الإقامة",
            "value": "مشمولة"
          }
        ],
        "practical": "تقييم الحريف، تصميم البرامج، تقنيات تمارين القوة بأمان، التغذية والمرافقة: يغطي البرنامج كامل مهنة المدرب الشخصي. تواصل معنا لمعرفة موعد ومكان الدورة القادمة."
      }
    }
  }
};

export const TSA_FORMATIONS: Record<string, unknown>[] = [
  {
    "slug": "intervention-initiale",
    "academy": "tsa",
    "accent": "intervention",
    "position": 10,
    "status": "published",
    "name": "Intervention initiale & sécurité",
    "headline": "Parcours de formation",
    "summary": "En quatre jours, préparez les équipes de première intervention à faire face aux attaques terroristes et criminelles : repérage des risques, gestion des conflits, intervention initiale, évacuation et mise à l'abri.",
    "durationLabel": "4 jours",
    "location": "Hammamet",
    "practical": "Formation organisée à Hammamet, hébergement inclus pendant la formation. Contactez l'académie pour connaître les prochaines dates et les modalités.",
    "objectives": [
      "Activation du dispositif d'auto-sécurité",
      "Étude des risques potentiels",
      "Gestion des conflits",
      "Méthodes d'évacuation et de mise à l'abri",
      "Intervention initiale face aux incidents et aux dangers"
    ],
    "coverUrl": "/pics/banner_images/banner3.jpg",
    "coverIsPoster": false,
    "videos": [
      {
        "url": "https://www.facebook.com/reel/1747595872982498/",
        "title": "",
        "layout": "portrait"
      },
      {
        "url": "https://www.facebook.com/reel/1591488295804767/",
        "title": "",
        "layout": "square"
      }
    ],
    "translations": {
      "en": {
        "name": "Initial response & security",
        "headline": "Training pathway",
        "summary": "In four days, prepare first-response teams to deal with terrorist and criminal attacks: risk spotting, conflict management, first response, evacuation and sheltering.",
        "durationLabel": "4 days",
        "practical": "The course takes place in Hammamet, with accommodation included during the training. Contact the academy for upcoming dates and arrangements.",
        "objectives": [
          "Activating a self-security plan",
          "Assessing potential risks",
          "Conflict management",
          "Evacuation and shelter procedures",
          "Initial response to incidents and hazards"
        ]
      },
      "ar": {
        "name": "التدخل الأولي والأمن",
        "headline": "مسار تكويني",
        "summary": "في أربعة أيام، جهّز فرق التدخل الأولي لمواجهة الهجمات الإرهابية والإجرامية: رصد المخاطر، إدارة النزاعات، التدخل الأولي، الإخلاء والإيواء.",
        "durationLabel": "4 أيام",
        "practical": "يُنظَّم التكوين في الحمامات مع الإقامة طيلة فترة التكوين. تواصل مع الأكاديمية لمعرفة المواعيد والشروط القادمة.",
        "objectives": [
          "تفعيل منظومة التأمين الذاتي",
          "دراسة المخاطر المحتملة",
          "إدارة النزاعات",
          "طرق الإخلاء والإجلاء",
          "التدخل الأولي لمواجهة الحوادث والأخطار"
        ]
      }
    }
  },
  {
    "slug": "k9",
    "academy": "tsa",
    "accent": "k9",
    "position": 11,
    "status": "published",
    "name": "Éducateur canin & homme d'attaque K9",
    "headline": "Formation spécialisée",
    "summary": "Apprenez la psychologie canine, l'obéissance et la conduite professionnelle d'un chien K9. Formation de 15 jours à Manouba : contactez-nous pour la prochaine session.",
    "durationLabel": "15 jours",
    "location": "Manouba · Tunis",
    "practical": "Deux certificats reconnus en Tunisie et à l'étranger sont délivrés à l'issue de la formation. Contactez l'académie pour connaître les dates de la prochaine session.",
    "objectives": [
      "Psychologie canine",
      "Obéissance",
      "Éducation canine et conduite professionnelle d'un chien K9"
    ],
    "coverUrl": "/pics/k9.jpg",
    "coverIsPoster": true,
    "contactPhone": "+216 24 076 368",
    "sourceUrl": "https://www.facebook.com/story.php?story_fbid=992042216718515&id=100077382387038",
    "videos": [],
    "translations": {
      "en": {
        "name": "Canine educator & K9 attack-dog handler",
        "headline": "Specialist training",
        "summary": "Learn canine psychology, obedience and professional K9 dog handling. A 15-day course in Manouba: contact us for the next session.",
        "durationLabel": "15 days",
        "location": "Manouba · Tunis",
        "practical": "Two certificates recognised in Tunisia and abroad are awarded at the end of the course. Contact the academy for the next session dates.",
        "objectives": [
          "Canine psychology",
          "Obedience",
          "Canine education and professional K9 handling"
        ]
      },
      "ar": {
        "name": "مربي كلاب ومرافق كلاب التدخل K9",
        "headline": "تكوين تخصصي",
        "summary": "تعلّم علم نفس الكلاب والطاعة والقيادة المهنية لكلب K9. تكوين لمدة 15 يومًا في منوبة: تواصل معنا لمعرفة الدورة القادمة.",
        "durationLabel": "15 يومًا",
        "location": "منوبة · تونس",
        "practical": "تُسلَّم في نهاية التكوين شهادتان معترف بهما في تونس وخارجها. تواصل مع الأكاديمية لمعرفة مواعيد الدورة القادمة.",
        "objectives": [
          "سلوك الكلاب",
          "الطاعة",
          "تربية الكلاب والتعامل المهني مع K9"
        ]
      }
    }
  },
  {
    "slug": "protection-rapprochee",
    "academy": "tsa",
    "accent": "protection",
    "position": 12,
    "status": "published",
    "name": "Équipe de protection rapprochée",
    "headline": "Formation spécialisée",
    "summary": "Formez-vous au travail en équipe de protection rapprochée : découvrez la formation en vidéo et contactez l'académie pour le programme détaillé.",
    "durationLabel": null,
    "location": "",
    "practical": "Programme détaillé, durée et prochaines dates : contactez directement l'académie.",
    "objectives": [],
    "coverUrl": "/pics/banner_images/banner1.jpeg",
    "coverIsPoster": false,
    "videos": [
      {
        "url": "https://www.facebook.com/reel/1231628108029497/",
        "title": "",
        "layout": "portrait"
      },
      {
        "url": "https://www.facebook.com/reel/1082973183535260/",
        "title": "",
        "layout": "landscape"
      }
    ],
    "translations": {
      "en": {
        "name": "Close-protection team training",
        "headline": "Specialist training",
        "summary": "Learn to work as a close-protection team: watch the course on video and contact the academy for the detailed programme.",
        "practical": "Detailed programme, duration and upcoming dates: contact the academy directly."
      },
      "ar": {
        "name": "تكوين فريق الحماية القريبة",
        "headline": "تكوين تخصصي",
        "summary": "تعلّم العمل ضمن فريق حماية مقربة: شاهد التكوين بالفيديو وتواصل مع الأكاديمية للحصول على البرنامج المفصّل.",
        "practical": "البرنامج المفصّل والمدة والمواعيد القادمة: تواصل مباشرة مع الأكاديمية."
      }
    }
  },
  {
    "slug": "securite-protection",
    "academy": "tsa",
    "accent": "gold",
    "position": 13,
    "status": "published",
    "name": "Formation professionnelle en sécurité",
    "headline": "Programme de formation",
    "summary": "Spécialités, contenus et informations pratiques : téléchargez le programme de formation DSP, puis contactez l'équipe pour préciser votre demande.",
    "durationLabel": null,
    "location": "",
    "practical": "Chaque demande est étudiée selon votre site, votre contexte et vos contraintes. Contactez l'équipe pour définir ensemble le dispositif adapté.",
    "objectives": [],
    "coverUrl": "/pics/banner_images/banner18.jpeg",
    "coverIsPoster": false,
    "contactPhone": "+216 29 039 493",
    "sourceUrl": "https://acrobat.adobe.com/id/urn:aaid:sc:EU:42ab2b8c-bc1a-4c97-8286-b7da59f35486",
    "videos": [],
    "translations": {
      "en": {
        "name": "Professional Security Training",
        "headline": "Training programme",
        "summary": "Specialities, content and practical information: download the DSP training programme, then contact the team to discuss your request.",
        "practical": "Every request is assessed according to your site, context and constraints. Contact the team to define the right set-up together."
      },
      "ar": {
        "name": "التكوين المهني في الأمن",
        "headline": "برنامج التكوين",
        "summary": "الاختصاصات والمحتوى والمعلومات العملية: حمّل برنامج تكوين DSP ثم تواصل مع الفريق لتوضيح طلبك.",
        "practical": "ندرس كل طلب حسب موقعك وسياقك وقيودك. تواصل مع الفريق لنحدّد معًا الترتيب المناسب."
      }
    }
  }
];

export const TRAINERS: { name: string; title: string; bio: string; academy: "fitness" | "tsa"; formations: string[]; translations: LangText }[] = [
  {
    "name": "Riadh Sessi",
    "title": "Cynophile Coaching",
    "bio": "Animée par Riadh Sessi (Cynophile Coaching)",
    "academy": "tsa",
    "formations": [
      "k9"
    ],
    "translations": {
      "en": {
        "title": "Cynophile Coaching",
        "bio": "Led by Riadh Sessi (Cynophile Coaching)"
      },
      "ar": {
        "title": "Cynophile Coaching",
        "bio": "يؤطّرها رياض سيسي (Cynophile Coaching)"
      }
    }
  }
];

export const HISTORY: Record<string, unknown>[] = [
  {
    "academy": "fitness",
    "activity": "pilates",
    "date": null,
    "status": "course",
    "title": "Formation Pilates Matwork & Reformer · niveaux 1 et 2",
    "description": "Le programme comprend 40 heures sur six jours à Nabeul, en Matwork & Reformer, niveaux 1 et 2, avec une certification à l'issue de la formation. Le post identifie Defenders Fitness Academy comme organisme et cite l'agrément 21-340-24. Il mentionne aussi des contrats de travail à l'étranger sans préciser d'employeur ni de conditions. Aucune date de session n'est indiquée ; l'un des vidéos donne le numéro d'inscription +216 92 204 005.",
    "place": "Nabeul, Tunisie",
    "videos": [
      {
        "url": "https://www.facebook.com/reel/1380600687572791/",
        "title": "Pilates · vidéo 1",
        "layout": "portrait"
      },
      {
        "url": "https://www.facebook.com/reel/2149688955939054/",
        "title": "Pilates · vidéo 2",
        "layout": "portrait"
      }
    ],
    "sources": [
      {
        "url": "https://www.facebook.com/share/r/1985tDibWA/",
        "label": "Voir la vidéo · programme Pilates"
      },
      {
        "url": "https://www.facebook.com/share/r/1HW4hfeYzt/",
        "label": "Voir la vidéo · détails et certification"
      }
    ],
    "translations": {
      "en": {
        "title": "Pilates Matwork & Reformer training · Levels 1 and 2",
        "description": "The course covers 40 hours over six days in Nabeul, Matwork & Reformer Levels 1 and 2, with certification on completion. The post identifies Defenders Fitness Academy as the provider and cites authorisation 21-340-24. It also mentions overseas employment contracts without naming an employer or terms. No session date is provided; one video lists +216 92 204 005 for registration.",
        "place": "Nabeul, Tunisia"
      },
      "ar": {
        "title": "تكوين Pilates Matwork وReformer · المستوى 1 و2",
        "description": "يتضمن البرنامج 40 ساعة على ستة أيام في نابل، للمستويين الأول والثاني في Matwork وReformer، مع شهادة عند إتمام التكوين. ويذكر المنشور Defenders Fitness Academy كجهة منظمة ورقم الاعتماد 21-340-24. كما يذكر عقود عمل بالخارج دون تحديد جهة العمل أو الشروط. لم يُذكر موعد للدورة؛ ويعرض أحد الفيديوهات رقم التسجيل +216 92 204 005.",
        "place": "نابل، تونس"
      }
    }
  },
  {
    "academy": "fitness",
    "activity": "pilates",
    "date": "2026-11-05",
    "status": "course",
    "title": "Pilates Matwork & Reformer · niveaux 1 et 2",
    "description": "Le programme indique Matwork du 27 au 29 novembre et Reformer du 4 au 6 décembre à Sunset Studio Pilates, pour 40 heures au total. Ces dates correspondent au calendrier indiqué dans le post ; la disponibilité et la réalisation des sessions ne sont pas confirmées.",
    "place": "Sunset Studio Pilates · Lac 1, Tunis",
    "videos": [
      {
        "url": "https://www.instagram.com/reel/DfXPgOJHGKx/embed/",
        "title": "Pilates · programme Matwork & Reformer",
        "layout": "portrait"
      }
    ],
    "sources": [
      {
        "url": "https://www.instagram.com/defenders_fitness_academy/reel/DfXPgOJHGKx/",
        "label": ""
      }
    ],
    "translations": {
      "en": {
        "title": "Pilates Matwork & Reformer · Levels 1 and 2",
        "description": "The programme lists Matwork for 27–29 November and Reformer for 4–6 December at Sunset Studio Pilates, for 40 hours in total. These dates are the schedule stated in the post; availability and delivery are not confirmed.",
        "place": "Sunset Studio Pilates · Lac 1, Tunis"
      },
      "ar": {
        "title": "Pilates Matwork وReformer · المستوى 1 و2",
        "description": "يحدد البرنامج Matwork من 27 إلى 29 نوفمبر وReformer من 4 إلى 6 ديسمبر في Sunset Studio Pilates، بإجمالي 40 ساعة. هذه هي المواعيد الواردة في المنشور؛ ولم يتم تأكيد التوفر أو انعقاد الدورات.",
        "place": "Sunset Studio Pilates · البحيرة 1، تونس"
      }
    }
  },
  {
    "academy": "fitness",
    "activity": "football",
    "date": null,
    "status": "course",
    "title": "Formation de quatre jours pour entraîneurs de football",
    "description": "Le post décrit une formation de quatre jours à Hammamet, avec des intervenants présentés comme internationaux et agréés. Le programme comprend la théorie et la pratique, les compétences de base, des séances suivant un programme anglais, l'analyse du jeu et les méthodes d'entraînement. Le post indique deux certificats internationaux (coaching football et premiers secours sportifs/CPR), un séjour en pension complète avec trois repas par jour et un tarif de 750 TND. Il fournit les numéros +216 29 039 493 et +216 92 204 005 pour les renseignements. Aucune date de session n'est indiquée.",
    "place": "Hammamet, Tunisie",
    "videos": [
      {
        "url": "https://www.facebook.com/reel/1818481708830444/",
        "title": "Formation football · programme",
        "layout": "portrait"
      }
    ],
    "sources": [
      {
        "url": "https://www.facebook.com/share/r/1DGzq17D8M/",
        "label": ""
      }
    ],
    "translations": {
      "en": {
        "title": "Four-day football-coach training course",
        "description": "The post describes a four-day course in Hammamet with instructors it presents as international and accredited. Topics include theory and practical coaching, foundational skills, sessions following an English-language curriculum, game analysis, and coaching methods. It lists two international certificates (football coaching and sports first aid/CPR), full-board accommodation with three meals daily, and a fee of 750 TND. It gives +216 29 039 493 and +216 92 204 005 for inquiries. No session date is provided.",
        "place": "Hammamet, Tunisia"
      },
      "ar": {
        "title": "تكوين مدربي كرة القدم لمدة أربعة أيام",
        "description": "يصف المنشور تكوينًا لمدة أربعة أيام في الحمامات بإشراف محاضرين يقدمهم بوصفهم دوليين ومعتمدين. ويشمل البرنامج الجانب النظري والتطبيقي والمهارات الأساسية وحصصًا وفق المنهج الإنجليزي وتحليل اللعب وطرق التدريب. ويذكر المنشور شهادتين دوليتين (تدريب كرة القدم والإسعافات الأولية الرياضية/الإنعاش القلبي الرئوي) وإقامة كاملة مع ثلاث وجبات يوميًا بسعر 750 دينارًا تونسيًا. كما يورد الرقمين +216 29 039 493 و+216 92 204 005 للاستفسار. لم يُذكر موعد للدورة.",
        "place": "الحمامات، تونس"
      }
    }
  },
  {
    "academy": "fitness",
    "activity": "football",
    "date": "2026-06-09",
    "status": "course",
    "title": "Enregistrement du projet de formation des entraîneurs de football",
    "description": "Le post de l'académie indique que les démarches d'enregistrement d'un projet de formation d'entraîneurs de football avaient été réalisées. Les spécialités citées sont le coaching de base, la préparation physique, le coaching des gardiens et la direction technique et sportive. Le post ne confirme pas l'agrément de chaque spécialité ni la tenue d'une session.",
    "place": "",
    "videos": [],
    "sources": [
      {
        "url": "https://www.facebook.com/DefendersFitnessAcademy",
        "label": ""
      }
    ],
    "translations": {
      "en": {
        "title": "Registration of the football-coach training project",
        "description": "The academy's post says registration procedures for a football-coach training project had been completed. The listed specialities are basic coaching, physical preparation, goalkeeper coaching, and technical and sporting direction. The post does not verify each programme's authorisation or confirm that a session took place.",
        "place": ""
      },
      "ar": {
        "title": "تسجيل مشروع تكوين مدربي كرة القدم",
        "description": "يذكر منشور الأكاديمية استكمال إجراءات تسجيل مشروع تكوين مدربي كرة القدم. وتشمل الاختصاصات المذكورة التدريب الأساسي والإعداد البدني وتدريب حراس المرمى والإدارة الفنية والرياضية. ولا يؤكد المنشور ترخيص كل اختصاص أو انعقاد دورة.",
        "place": ""
      }
    }
  },
  {
    "academy": "tsa",
    "activity": "k9",
    "date": "2026-05-03",
    "status": "course",
    "title": "Formation K9 · éducateur canin et homme d'attaque",
    "description": "Le post du 3 mai 2026 présente une formation de 15 jours à Manouba avec Cynophile Coaching, alliant théorie et pratique en psychologie canine, obéissance et conduite K9. Il précise que deux certificats sont reconnus en Tunisie et à l'étranger, sans nommer les organismes émetteurs. Aucune date de session future n'est établie.",
    "place": "Manouba, Tunisie",
    "videos": [],
    "sources": [
      {
        "url": "https://www.facebook.com/share/p/1E7x6Xconw/",
        "label": ""
      }
    ],
    "translations": {
      "en": {
        "title": "K9 training · canine educator and attack-dog handler",
        "description": "The 3 May 2026 post presents a 15-day course in Manouba with Cynophile Coaching, combining theory and practice in canine psychology, obedience, and K9 handling. It says two certificates are recognised in Tunisia and abroad but does not name the issuing bodies. No future session date is established.",
        "place": "Manouba, Tunisia"
      },
      "ar": {
        "title": "تكوين K9 · مربي كلاب ومرافق كلاب التدخل",
        "description": "يعرض منشور 3 ماي 2026 تكوينًا مدته 15 يومًا في منوبة مع Cynophile Coaching، يجمع بين النظري والتطبيقي في سلوك الكلاب والطاعة والتعامل مع K9. ويذكر أن شهادتين معترف بهما في تونس والخارج دون تحديد الجهات المصدرة. لم يُحدد موعد لدورة مستقبلية.",
        "place": "منوبة، تونس"
      }
    }
  },
  {
    "academy": "tsa",
    "activity": "intervention-initiale",
    "date": "2026-09-08",
    "status": "course",
    "title": "Formation pour agents de sécurité et équipes de première intervention",
    "description": "Le post décrit un programme de quatre jours destiné aux agents de sécurité et de gardiennage d'hôtels et d'établissements sensibles. L'académie le situe aussi dans la préparation d'équipes de première intervention face aux attaques terroristes et criminelles ; le post décrit toutefois les objectifs plus généralement comme la réponse aux incidents et aux dangers. Les thèmes cités comprennent l'auto-sécurité, l'étude des risques, la gestion des conflits et l'évacuation. Aucune date de session ni réalisation n'est confirmée.",
    "place": "Hammamet · dates exactes non établies",
    "videos": [
      {
        "url": "https://www.facebook.com/reel/1591488295804767/",
        "title": "Intervention initiale et sécurité",
        "layout": "square"
      }
    ],
    "sources": [
      {
        "url": "https://www.facebook.com/share/v/19iShpsQa8/",
        "label": ""
      }
    ],
    "translations": {
      "en": {
        "title": "Security-officer and first-response team training",
        "description": "The post describes a four-day programme for security and guarding staff at hotels and sensitive establishments. The academy also frames it as preparing first-response teams for terrorist and criminal attacks; the post itself describes the objective more generally as responding to incidents and hazards. Listed topics include self-security, risk assessment, conflict management, and evacuation. No session date or completion is confirmed.",
        "place": "Hammamet · exact dates not established"
      },
      "ar": {
        "title": "تكوين أعوان الأمن وفرق التدخل الأولي",
        "description": "يصف المنشور برنامجًا مدته أربعة أيام لأعوان الأمن والحراسة في الفنادق والمؤسسات الحساسة. كما تقدم الأكاديمية التكوين بوصفه إعدادًا لفرق التدخل الأولي في مواجهة الهجمات الإرهابية والإجرامية؛ لكن المنشور نفسه يصف الهدف بصورة عامة بأنه الاستجابة للحوادث والأخطار. وتشمل المواضيع المذكورة الأمن الذاتي وتقييم المخاطر وإدارة النزاعات والإخلاء. لم يتم تأكيد موعد الدورة أو إنجازها.",
        "place": "الحمامات · لم يتم تحديد التواريخ بدقة"
      }
    }
  },
  {
    "academy": "tsa",
    "activity": "intervention-initiale",
    "date": "2026-10-23",
    "status": "course",
    "title": "Formation de futurs intervenants de première réponse avec CFA La Marsa",
    "description": "Le post de l'académie décrit une collaboration avec CFA La Marsa autour de la formation de futurs intervenants de première réponse. Les détails de session et sa réalisation ne sont pas établis.",
    "place": "",
    "videos": [
      {
        "url": "https://www.facebook.com/reel/1747595872982498/",
        "title": "Formation des futurs intervenants",
        "layout": "portrait"
      }
    ],
    "sources": [
      {
        "url": "https://www.facebook.com/share/r/1D4ZZCjZku/",
        "label": ""
      }
    ],
    "translations": {
      "en": {
        "title": "First-responder training collaboration with CFA La Marsa",
        "description": "The academy post describes a collaboration with CFA La Marsa to train future first responders. Session details and completion have not been established.",
        "place": ""
      },
      "ar": {
        "title": "تعاون لتكوين مستجيبين أوائل مع CFA La Marsa",
        "description": "يصف منشور الأكاديمية تعاونًا مع CFA La Marsa لتكوين مستجيبين أوائل. لم يتم التثبت من تفاصيل الدورة أو إنجازها.",
        "place": ""
      }
    }
  }
];

export const MEDIA: { type: "image" | "video"; category: string; academy: "fitness" | "tsa" | null; position: number; url: string; title: string }[] = [
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 0,
    "url": "/pics/Pilates_images/acc_images1.jpg",
    "title": "Exercice de Pilates sur Reformer avec sangles"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 1,
    "url": "/pics/football_images/staff-technique.jpg",
    "title": "Staff technique préparant une séance d'entraînement au bord du terrain"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 2,
    "url": "/pics/personal_trainers/coaching-technique.jpg",
    "title": "Coach personnel corrigeant la technique d'une cliente en salle"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 3,
    "url": "/pics/Pilates_images/acc_images.jpg",
    "title": "Travail de jambes sur Reformer dans un studio lumineux"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 4,
    "url": "/pics/football_images/seance-equipe.jpg",
    "title": "Équipe à l'échauffement pendant une séance d'entraînement"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 5,
    "url": "/pics/personal_trainers/coaching-halterophilie.jpg",
    "title": "Coach supervisant un soulevé de terre en salle de musculation"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 6,
    "url": "/pics/Pilates_images/acc_images2.jpg",
    "title": "Deux pratiquantes en séance de Pilates Reformer"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 7,
    "url": "/pics/football_images/exercice-plots.jpg",
    "title": "Joueur réalisant un exercice technique entre les plots"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 8,
    "url": "/pics/personal_trainers/suivi-client.jpg",
    "title": "Coach faisant le point avec sa cliente sur une tablette"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 9,
    "url": "/pics/Pilates_images/pilates-unsplash-3.jpg",
    "title": "Travail des jambes aux sangles sur Reformer"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 10,
    "url": "/pics/football_images/coach-terrain.jpg",
    "title": "Entraîneur donnant des consignes à une joueuse sur le terrain"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 11,
    "url": "/pics/personal_trainers/coaching-equilibre.jpg",
    "title": "Coach accompagnant un exercice d'équilibre"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 12,
    "url": "/pics/Pilates_images/pilates-unsplash-4.jpg",
    "title": "Exercice d'équilibre debout sur le Reformer"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 13,
    "url": "/pics/football_images/2.jpeg",
    "title": "Équipe de jeunes joueurs et leurs encadrants sur le terrain"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 14,
    "url": "/pics/Pilates_images/pilates-unsplash-5.jpg",
    "title": "Gainage sur Reformer dans un studio de Pilates"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "fitness",
    "position": 15,
    "url": "/pics/Pilates_images/pilates-studio.jpg",
    "title": "Studio de Pilates équipé de plusieurs Reformers"
  },
  {
    "type": "video",
    "category": "galerie",
    "academy": "fitness",
    "position": 0,
    "url": "https://www.facebook.com/reel/1380600687572791/",
    "title": ""
  },
  {
    "type": "video",
    "category": "galerie",
    "academy": "fitness",
    "position": 1,
    "url": "https://www.facebook.com/reel/2149688955939054/",
    "title": ""
  },
  {
    "type": "video",
    "category": "galerie",
    "academy": "fitness",
    "position": 2,
    "url": "https://www.facebook.com/reel/1818481708830444/",
    "title": ""
  },
  {
    "type": "video",
    "category": "galerie",
    "academy": "fitness",
    "position": 3,
    "url": "https://www.facebook.com/reel/877141621507702/",
    "title": ""
  },
  {
    "type": "video",
    "category": "galerie",
    "academy": "fitness",
    "position": 4,
    "url": "https://www.facebook.com/reel/3279150018914978/",
    "title": ""
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "tsa",
    "position": 0,
    "url": "/pics/k9.jpg",
    "title": "Affiche de la formation Éducateur canin & homme d'attaque K9, animée par Riadh Sessi"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "tsa",
    "position": 1,
    "url": "/pics/banner_images/banner6.jpeg",
    "title": "Séance théorique en salle avec l'ensemble des stagiaires"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "tsa",
    "position": 2,
    "url": "/pics/banner_images/banner18.jpeg",
    "title": "Remise de certificat à un stagiaire de Defenders Academy"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "tsa",
    "position": 3,
    "url": "/pics/banner_images/banner5.jpeg",
    "title": "Promotion de stagiaires réunie en salle de formation"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "tsa",
    "position": 4,
    "url": "/pics/banner_images/banner7.jpeg",
    "title": "Remise officielle d'un certificat de formation"
  },
  {
    "type": "image",
    "category": "galerie",
    "academy": "tsa",
    "position": 5,
    "url": "/pics/banner_images/banner18.jpeg",
    "title": "Remise de certificat à un stagiaire de Defenders Academy"
  },
  {
    "type": "video",
    "category": "galerie",
    "academy": "tsa",
    "position": 0,
    "url": "https://www.facebook.com/reel/1231628108029497/",
    "title": ""
  },
  {
    "type": "video",
    "category": "galerie",
    "academy": "tsa",
    "position": 1,
    "url": "https://www.facebook.com/reel/1082973183535260/",
    "title": ""
  },
  {
    "type": "video",
    "category": "galerie",
    "academy": "tsa",
    "position": 2,
    "url": "https://www.facebook.com/reel/1747595872982498/",
    "title": ""
  },
  {
    "type": "video",
    "category": "galerie",
    "academy": "tsa",
    "position": 3,
    "url": "https://www.facebook.com/reel/1591488295804767/",
    "title": ""
  },
  {
    "type": "video",
    "category": "accueil",
    "academy": "tsa",
    "position": 0,
    "url": "https://www.facebook.com/reel/1082973183535260/",
    "title": "Équipe de protection rapprochée"
  },
  {
    "type": "video",
    "category": "videos",
    "academy": "fitness",
    "position": 0,
    "url": "https://www.facebook.com/reel/877141621507702/",
    "title": "Personal Training · vidéo 1"
  },
  {
    "type": "video",
    "category": "videos",
    "academy": "fitness",
    "position": 1,
    "url": "https://www.facebook.com/reel/3279150018914978/",
    "title": "Personal Training · vidéo 2"
  },
  {
    "type": "video",
    "category": "videos",
    "academy": "fitness",
    "position": 2,
    "url": "https://www.facebook.com/reel/796475196712099/",
    "title": "Personal Training · vidéo 3"
  },
  {
    "type": "video",
    "category": "temoignage",
    "academy": "fitness",
    "position": 0,
    "url": "https://www.facebook.com/reel/842610331713875/",
    "title": "Témoignage vidéo d'un stagiaire 1"
  },
  {
    "type": "video",
    "category": "temoignage",
    "academy": "fitness",
    "position": 1,
    "url": "https://www.facebook.com/reel/726579750525884/",
    "title": "Témoignage vidéo d'un stagiaire 2"
  },
  {
    "type": "video",
    "category": "temoignage",
    "academy": "fitness",
    "position": 2,
    "url": "https://www.facebook.com/reel/926929733328196/",
    "title": "Témoignage vidéo d'un stagiaire 3"
  },
  {
    "type": "image",
    "category": "bandeau",
    "academy": null,
    "position": 0,
    "url": "/pics/banner_images/banner18.jpeg",
    "title": "Remise de certificat à un stagiaire de Defenders Academy"
  },
  {
    "type": "image",
    "category": "bandeau",
    "academy": null,
    "position": 1,
    "url": "/pics/banner_images/banner1.jpeg",
    "title": "Diplômé entouré des formateurs lors de la cérémonie de certification"
  },
  {
    "type": "image",
    "category": "bandeau",
    "academy": null,
    "position": 2,
    "url": "/pics/banner_images/banner5.jpeg",
    "title": "Promotion de stagiaires réunie en salle de formation"
  },
  {
    "type": "image",
    "category": "bandeau",
    "academy": null,
    "position": 3,
    "url": "/pics/banner_images/banner2.jpeg",
    "title": "Stagiaire recevant son certificat de fin de formation"
  },
  {
    "type": "image",
    "category": "bandeau",
    "academy": null,
    "position": 4,
    "url": "/pics/banner_images/banner6.jpeg",
    "title": "Séance théorique en salle avec l'ensemble des stagiaires"
  },
  {
    "type": "image",
    "category": "bandeau",
    "academy": null,
    "position": 5,
    "url": "/pics/banner_images/banner3.jpg",
    "title": "Cérémonie de certification : stagiaire et formateurs"
  },
  {
    "type": "image",
    "category": "bandeau",
    "academy": null,
    "position": 6,
    "url": "/pics/banner_images/banner7.jpeg",
    "title": "Remise officielle d'un certificat de formation"
  },
  {
    "type": "image",
    "category": "bandeau",
    "academy": null,
    "position": 7,
    "url": "/pics/banner_images/banner4.jpg",
    "title": "Stagiaire certifiée posant avec les formateurs"
  }
];

/** Traductions des questions fréquentes d'origine (clé : question en français). */
export const FAQ_TRANSLATIONS: Record<string, LangText> = {
  "À qui s'adressent les formations ?": {
    "en": {
      "title": "Who are the courses for?",
      "body": "Coaches who want to specialise, athletes with more than 2 years of experience and sports science graduates. Contact the team to check a session's prerequisites."
    },
    "ar": {
      "title": "لمن تتوجه التكوينات؟",
      "body": "للمدربين الراغبين في التخصص، وللرياضيين الذين لديهم أكثر من سنتين خبرة، ولخريجي علوم الرياضة. اتصل بالفريق للتأكد من شروط الدورة."
    }
  },
  "Les formations bénéficient-elles d'un suivi médical ?": {
    "en": {
      "title": "Is there medical follow-up during the courses?",
      "body": "Yes: doctors follow every course, for injury prevention and trainee support."
    },
    "ar": {
      "title": "هل توجد متابعة طبية خلال التكوين؟",
      "body": "نعم: يتابع أطباء كل تكوين للوقاية من الإصابات ومرافقة المتكونين."
    }
  },
  "Quelles spécialités football sont proposées ?": {
    "en": {
      "title": "Which football specialisations are offered?",
      "body": "Football coaching, physical preparation, goalkeeper coaching and technical or sporting direction. Football and security courses are offered exclusively in Tunisia."
    },
    "ar": {
      "title": "ما هي اختصاصات كرة القدم المقترحة؟",
      "body": "تدريب كرة القدم، الإعداد البدني، تدريب حراس المرمى والإدارة الفنية أو الرياضية. تكوينات كرة القدم والأمن حصرية في تونس."
    }
  },
  "Une certification est-elle délivrée ?": {
    "en": {
      "title": "Is a certificate awarded?",
      "body": "Courses include a theoretical and practical assessment, with a certificate at the end (approval no. 21-340-24)."
    },
    "ar": {
      "title": "هل تُسلَّم شهادة؟",
      "body": "تتضمن المسارات تقييمًا نظريًا وتطبيقيًا، مع شهادة في ختام التكوين (ترخيص عدد 21-340-24)."
    }
  },
  "Où ont lieu les sessions ?": {
    "en": {
      "title": "Where do sessions take place?",
      "body": "The academy is located in Hammamet. The exact venue depends on the session: check the schedule or contact the team."
    },
    "ar": {
      "title": "أين تنعقد الدورات؟",
      "body": "مقر الأكاديمية في الحمامات. يختلف المكان حسب الدورة: اطّلع على الرزنامة أو اتصل بالفريق."
    }
  },
  "Comment connaître les tarifs et les prochaines dates ?": {
    "en": {
      "title": "How can I find out prices and upcoming dates?",
      "body": "Each course has its date in the schedule. Contact the academy for prices and available places."
    },
    "ar": {
      "title": "كيف أعرف الأسعار والمواعيد القادمة؟",
      "body": "لكل تكوين تاريخه في الرزنامة. اتصل بالأكاديمية لمعرفة الأسعار والأماكن المتاحة."
    }
  }
};
