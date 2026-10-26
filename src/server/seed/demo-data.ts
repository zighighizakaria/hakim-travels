/**
 * Contenus de démonstration FR + AR. Tout ce qui en est issu est marqué is_demo = 1
 * et peut être supprimé depuis le back-office (« Supprimer les données démo »).
 * L'arabe est à faire relire par un arabophone avant la mise en production.
 */

export type Bi = { fr: string; ar: string };
const b = (fr: string, ar: string): Bi => ({ fr, ar });

export type AssetKey =
  | "turquie"
  | "bali"
  | "egypte"
  | "omra"
  | "gallery-1"
  | "gallery-2"
  | "gallery-3"
  | "gallery-4"
  | "gallery-5"
  | "gallery-6";

export type DemoImage = { key: AssetKey; file: string; alt: Bi };

export const demoImages: DemoImage[] = [
  {
    key: "turquie",
    file: "turquie.jpg",
    alt: b(
      "Sainte-Sophie et ferries sur le Bosphore à Istanbul au coucher du soleil",
      "آيا صوفيا وعبّارات على البوسفور في إسطنبول عند الغروب",
    ),
  },
  {
    key: "bali",
    file: "bali.jpg",
    alt: b(
      "Rizières en terrasses et cocotiers dans une brume dorée",
      "حقول أرز مدرّجة وأشجار جوز الهند وسط ضباب ذهبي",
    ),
  },
  {
    key: "egypte",
    file: "egypte.jpg",
    alt: b(
      "Pyramides de Gizeh dans la lumière orangée du soir",
      "أهرامات الجيزة في ضوء المساء البرتقالي",
    ),
  },
  {
    key: "omra",
    file: "omra.jpg",
    alt: b(
      "Cour de la Grande Mosquée de La Mecque à l'heure bleue",
      "باحة المسجد الحرام بمكة المكرمة في الساعة الزرقاء",
    ),
  },
  {
    key: "gallery-1",
    file: "gallery-1.jpg",
    alt: b(
      "Piscine à débordement face à l'océan au coucher du soleil",
      "مسبح لا متناهي الحواف مطل على المحيط عند الغروب",
    ),
  },
  {
    key: "gallery-2",
    file: "gallery-2.jpg",
    alt: b("Voyageur dans une ruelle éclairée par des lanternes", "مسافر في زقاق مضاء بالفوانيس"),
  },
  {
    key: "gallery-3",
    file: "gallery-3.jpg",
    alt: b("Barque traditionnelle sur une mer turquoise", "قارب تقليدي على بحر فيروزي"),
  },
  {
    key: "gallery-4",
    file: "gallery-4.jpg",
    alt: b(
      "Coupole verte de la mosquée du Prophète à Médine au crépuscule",
      "القبة الخضراء للمسجد النبوي بالمدينة المنورة عند الغروب",
    ),
  },
  {
    key: "gallery-5",
    file: "gallery-5.jpg",
    alt: b(
      "Petit-déjeuner sur une terrasse d'hôtel au lever du soleil",
      "فطور على شرفة فندق عند شروق الشمس",
    ),
  },
  {
    key: "gallery-6",
    file: "gallery-6.jpg",
    alt: b("Vue aérienne d'un littoral tropical", "منظر جوي لساحل استوائي"),
  },
];

/* -------------------------------------------------------------------------- */
/* Destinations                                                                */
/* -------------------------------------------------------------------------- */

export type DemoFaq = { q: Bi; a: Bi };
export type DemoLabelled = { label: Bi; text: Bi };

export type DemoDestination = {
  slug: string;
  universe: "maroc" | "international" | "omra";
  emoji: string;
  name: Bi;
  tagline: Bi;
  teaser: Bi;
  intro: Bi;
  highlights: Bi[];
  practical: DemoLabelled[];
  faqs: DemoFaq[];
  cover?: AssetKey;
  gallery: AssetKey[];
  featured: boolean;
};

const bestPeriod = b("Meilleure période", "أفضل فترة");

export const demoDestinations: DemoDestination[] = [
  /* ---------------------------------- Maroc --------------------------------- */
  {
    slug: "nord",
    universe: "maroc",
    emoji: "🌿",
    name: b("Nord", "الشمال"),
    tagline: b("Médinas bleues, cascades et forêts du Rif.", "مدن زرقاء وشلالات وغابات الريف."),
    teaser: b(
      "Chefchaouen, Akchour : médinas colorées et randonnées faciles à quelques heures des grandes villes.",
      "شفشاون وأقشور: مدن عتيقة ملونة ومسارات مشي سهلة على بعد ساعات قليلة من المدن الكبرى.",
    ),
    intro: b(
      "Du bleu de Chefchaouen aux cascades d'Akchour, le Nord du Maroc réunit médinas colorées, randonnées accessibles et paysages verts, à quelques heures de route de Casablanca et de Rabat.",
      "من زرقة شفشاون إلى شلالات أقشور، يجمع شمال المغرب بين المدن العتيقة الملونة ومسارات المشي السهلة والمناظر الخضراء، على بعد ساعات قليلة بالطريق من الدار البيضاء والرباط.",
    ),
    highlights: [
      b("Médina bleue de Chefchaouen", "المدينة الزرقاء في شفشاون"),
      b("Cascades et Pont de Dieu à Akchour", "شلالات أقشور وقنطرة الله"),
      b("Randonnées dans le parc Talassemtane", "جولات مشي في المنتزه الوطني تلاسمطان"),
      b("Gastronomie du Rif", "مأكولات الريف"),
    ],
    practical: [
      {
        label: bestPeriod,
        text: b("Mars à juin, septembre à novembre", "من مارس إلى يونيو ومن شتنبر إلى نونبر"),
      },
      {
        label: b("Depuis Casablanca", "انطلاقًا من الدار البيضاء"),
        text: b("Environ 5 heures de route", "حوالي 5 ساعات بالطريق"),
      },
    ],
    faqs: [
      {
        q: b("Faut-il être sportif pour Akchour ?", "هل يجب أن أكون رياضيًا لزيارة أقشور؟"),
        a: b(
          "Non. La randonnée vers le Pont de Dieu est accessible à la plupart des voyageurs en bonne santé, avec de bonnes chaussures.",
          "لا، فالمسار نحو قنطرة الله في متناول معظم المسافرين الأصحاء، مع ارتداء حذاء مناسب.",
        ),
      },
    ],
    gallery: [],
    featured: true,
  },
  {
    slug: "sud-desert",
    universe: "maroc",
    emoji: "🏜️",
    name: b("Sud et Désert", "الجنوب والصحراء"),
    tagline: b("Dunes, palmeraies et nuits étoilées.", "كثبان ونخيل وليالٍ مرصّعة بالنجوم."),
    teaser: b(
      "Merzouga, Zagora : les dunes de l'Erg Chebbi et le bivouac sous les étoiles.",
      "مرزوكة وزاكورة: كثبان عرق الشبي والمبيت في المخيم تحت النجوم.",
    ),
    intro: b(
      "Le Sud marocain se vit au rythme du désert : dunes de l'Erg Chebbi, kasbahs, palmeraies et bivouacs sous un ciel d'une clarté rare.",
      "يُعاش الجنوب المغربي على إيقاع الصحراء: كثبان عرق الشبي، والقصبات، وواحات النخيل، والمخيمات تحت سماء صافية نادرة.",
    ),
    highlights: [
      b("Dunes de l'Erg Chebbi à Merzouga", "كثبان عرق الشبي في مرزوكة"),
      b("Nuit en bivouac et dîner sous les étoiles", "ليلة في مخيم وعشاء تحت النجوم"),
      b("Balade à dos de dromadaire", "جولة على ظهر الجمل"),
      b("Palmeraies et kasbahs de la vallée du Drâa", "واحات النخيل والقصبات في وادي درعة"),
    ],
    practical: [
      {
        label: bestPeriod,
        text: b(
          "Octobre à avril (chaleur forte en été)",
          "من أكتوبر إلى أبريل (حرارة شديدة في الصيف)",
        ),
      },
      {
        label: b("Distances", "المسافات"),
        text: b(
          "Longs trajets : prévoir au moins 4 jours",
          "مسافات طويلة: يُنصح بما لا يقل عن 4 أيام",
        ),
      },
    ],
    faqs: [
      {
        q: b("Les nuits sont-elles froides ?", "هل تكون الليالي باردة؟"),
        a: b(
          "Oui, surtout en hiver : prévoyez des vêtements chauds pour la nuit.",
          "نعم، خاصة في الشتاء، لذا أحضروا ملابس دافئة لليل.",
        ),
      },
    ],
    gallery: [],
    featured: true,
  },
  {
    slug: "montagnes-atlas",
    universe: "maroc",
    emoji: "🏔️",
    name: b("Montagnes et Atlas", "الجبال والأطلس"),
    tagline: b("Sommets, cascades et forêts de cèdres.", "قمم وشلالات وغابات الأرز."),
    teaser: b(
      "Imlil, Ouzoud, Ifrane : le Haut et le Moyen Atlas à portée de week-end.",
      "إمليل وأوزود وإفران: الأطلسان الكبير والمتوسط في متناول عطلة نهاية الأسبوع.",
    ),
    intro: b(
      "Le Haut et le Moyen Atlas offrent un contraste immédiat avec les villes : vallées berbères, cascades d'Ouzoud, cèdres d'Ifrane et ascension du Toubkal, plus haut sommet d'Afrique du Nord.",
      "يمنح الأطلسان الكبير والمتوسط تباينًا فوريًا مع المدن: وديان أمازيغية، وشلالات أوزود، وأرز إفران، وصعود جبل توبقال، أعلى قمة في شمال إفريقيا.",
    ),
    highlights: [
      b("Village d'Imlil, au pied du Toubkal", "قرية إمليل عند سفح توبقال"),
      b("Cascades d'Ouzoud", "شلالات أوزود"),
      b("Forêts de cèdres d'Ifrane", "غابات الأرز في إفران"),
      b("Randonnées accompagnées", "جولات مشي بمرافقة مرشد"),
    ],
    practical: [
      {
        label: bestPeriod,
        text: b(
          "Avril à juin et septembre à octobre ; neige en hiver",
          "من أبريل إلى يونيو وفي شتنبر وأكتوبر، مع تساقط الثلوج شتاءً",
        ),
      },
      {
        label: b("Équipement", "التجهيزات"),
        text: b(
          "Chaussures de marche et vêtements chauds en plusieurs couches",
          "حذاء للمشي وملابس دافئة متعددة الطبقات",
        ),
      },
    ],
    faqs: [
      {
        q: b("Faut-il de l'expérience pour le Toubkal ?", "هل تلزم خبرة لصعود توبقال؟"),
        a: b(
          "Pas d'expérience alpine, mais une bonne condition physique est nécessaire.",
          "لا تلزم خبرة في تسلق الجبال، لكن اللياقة البدنية الجيدة ضرورية.",
        ),
      },
    ],
    gallery: [],
    featured: true,
  },
  {
    slug: "cote-atlantique",
    universe: "maroc",
    emoji: "🌊",
    name: b("Côte atlantique", "الساحل الأطلسي"),
    tagline: b("Remparts, vent et grand large.", "أسوار ورياح وأفق مفتوح على المحيط."),
    teaser: b(
      "Essaouira, Dakhla : patrimoine, sports de glisse et plages immenses.",
      "الصويرة والداخلة: تراث ورياضات الانزلاق وشواطئ ممتدة.",
    ),
    intro: b(
      "D'Essaouira et ses remparts à la lagune de Dakhla, la côte atlantique mêle patrimoine, sports de glisse et plages immenses.",
      "من الصويرة وأسوارها إلى خليج الداخلة، يجمع الساحل الأطلسي بين التراث ورياضات الانزلاق والشواطئ الممتدة.",
    ),
    highlights: [
      b("Médina et remparts d'Essaouira", "المدينة العتيقة وأسوار الصويرة"),
      b("Kitesurf et planche à voile à Dakhla", "الكايت سيرف والتزلج الشراعي في الداخلة"),
      b("Plages sauvages et couchers de soleil", "شواطئ بكر وغروب الشمس"),
      b("Poissons et fruits de mer frais", "أسماك وفواكه بحر طازجة"),
    ],
    practical: [
      {
        label: bestPeriod,
        text: b(
          "Toute l'année ; vent fort de mai à septembre",
          "طوال السنة، مع رياح قوية من ماي إلى شتنبر",
        ),
      },
    ],
    faqs: [
      {
        q: b("Dakhla est-elle loin ?", "هل الداخلة بعيدة؟"),
        a: b(
          "Oui, c'est un long trajet : le vol est souvent conseillé selon la formule.",
          "نعم، المسافة طويلة، ويُنصح غالبًا بالسفر جوًا حسب الصيغة.",
        ),
      },
    ],
    gallery: [],
    featured: false,
  },

  /* ------------------------------ International ----------------------------- */
  {
    slug: "turquie",
    universe: "international",
    emoji: "🇹🇷",
    name: b("Turquie", "تركيا"),
    tagline: b("Culture et paysages", "ثقافة ومناظر طبيعية"),
    teaser: b(
      "Istanbul, la Cappadoce et le Bosphore, entre héritage et modernité.",
      "إسطنبول وكبادوكيا والبوسفور، بين عراقة التاريخ وروح العصر.",
    ),
    intro: b(
      "Entre les coupoles d'Istanbul, les vallées de Cappadoce et les rivages de la mer Égée, la Turquie offre un condensé rare de patrimoine, de nature et d'art de vivre.",
      "بين قباب إسطنبول ووديان كبادوكيا وسواحل بحر إيجه، تقدّم تركيا مزيجًا نادرًا من التراث والطبيعة وفن العيش.",
    ),
    highlights: [
      b("Lever de soleil en Cappadoce", "شروق الشمس في كبادوكيا"),
      b("Croisière sur le Bosphore", "رحلة بحرية في البوسفور"),
      b("Grand Bazar et Sainte-Sophie", "البازار الكبير وآيا صوفيا"),
      b("Hammams et cuisine ottomane", "الحمّامات التركية والمطبخ العثماني"),
    ],
    practical: [
      {
        label: bestPeriod,
        text: b("Avril à juin, septembre à novembre", "من أبريل إلى يونيو ومن شتنبر إلى نونبر"),
      },
      {
        label: b("Vol depuis le Maroc", "الرحلة من المغرب"),
        text: b("Vols directs selon la saison", "رحلات مباشرة حسب الموسم"),
      },
      {
        label: b("Formalités", "إجراءات السفر"),
        text: b(
          "Nous vous informons des formalités en vigueur",
          "نُطلعكم على إجراءات السفر المعمول بها",
        ),
      },
      { label: b("Monnaie", "العملة"), text: b("Livre turque (TRY)", "الليرة التركية (TRY)") },
    ],
    faqs: [
      {
        q: b(
          "Quelle est la durée idéale d'un séjour en Turquie ?",
          "ما هي المدة المثالية لرحلة إلى تركيا؟",
        ),
        a: b(
          "La plupart de nos voyageurs partent entre 6 et 10 jours. Le programme exact est défini avec vous.",
          "يسافر معظم مسافرينا بين 6 و10 أيام، ويُحدَّد البرنامج الدقيق معكم.",
        ),
      },
      {
        q: b("Le vol est-il inclus ?", "هل تشمل الرحلة التذكرة الجوية؟"),
        a: b(
          "Selon la formule choisie. Contactez-nous pour connaître les options disponibles.",
          "حسب الصيغة المختارة، تواصلوا معنا لمعرفة الخيارات المتاحة.",
        ),
      },
    ],
    cover: "turquie",
    gallery: ["turquie", "gallery-2", "gallery-5", "gallery-3"],
    featured: true,
  },
  {
    slug: "egypte",
    universe: "international",
    emoji: "🇪🇬",
    name: b("Égypte", "مصر"),
    tagline: b("Histoire et Nil", "التاريخ والنيل"),
    teaser: b(
      "Des pyramides de Gizeh aux temples de Louxor, sur les traces des pharaons.",
      "من أهرامات الجيزة إلى معابد الأقصر، على خطى الفراعنة.",
    ),
    intro: b(
      "L'Égypte se découvre lentement : le Caire vibrant, la vallée du Nil, les temples millénaires et la lumière du désert au coucher du soleil.",
      "تُكتشف مصر ببطء: القاهرة النابضة بالحياة، ووادي النيل، والمعابد التي يعود عمرها لآلاف السنين، وضوء الصحراء عند الغروب.",
    ),
    highlights: [
      b("Pyramides de Gizeh", "أهرامات الجيزة"),
      b("Croisière sur le Nil", "رحلة نيلية"),
      b("Louxor et Assouan", "الأقصر وأسوان"),
      b("Mer Rouge en extension", "البحر الأحمر كإضافة اختيارية"),
    ],
    practical: [
      { label: bestPeriod, text: b("Octobre à avril", "من أكتوبر إلى أبريل") },
      {
        label: b("Vol depuis le Maroc", "الرحلة من المغرب"),
        text: b("Vol direct ou avec escale", "رحلة مباشرة أو مع توقف"),
      },
      { label: b("Monnaie", "العملة"), text: b("Livre égyptienne (EGP)", "الجنيه المصري (EGP)") },
    ],
    faqs: [
      {
        q: b("La croisière sur le Nil est-elle incluse ?", "هل الرحلة النيلية مشمولة؟"),
        a: b(
          "Selon la formule. Les détails du programme sont confirmés avant la réservation.",
          "حسب الصيغة المختارة، ويتم تأكيد تفاصيل البرنامج قبل الحجز.",
        ),
      },
      {
        q: b("Quel niveau de marche prévoir ?", "ما مقدار المشي المتوقع؟"),
        a: b(
          "Les visites de sites demandent un peu de marche. Nous adaptons le rythme si besoin.",
          "تتطلب زيارة المواقع بعض المشي، ونكيّف الإيقاع عند الحاجة.",
        ),
      },
    ],
    cover: "egypte",
    gallery: ["egypte", "gallery-2", "gallery-5", "gallery-1"],
    featured: true,
  },
  {
    slug: "bali",
    universe: "international",
    emoji: "🇮🇩",
    name: b("Bali", "بالي"),
    tagline: b("Nature et bien-être", "الطبيعة والاسترخاء"),
    teaser: b(
      "Rizières, temples et plages : une parenthèse tropicale hors du temps.",
      "حقول أرز ومعابد وشواطئ: استراحة استوائية خارج الزمن.",
    ),
    intro: b(
      "Bali conjugue spiritualité, nature luxuriante et hospitalité rare. Un terrain idéal pour un voyage de noces, une évasion en famille ou une retraite bien-être.",
      "تجمع بالي بين الروحانية والطبيعة الغنّاء وكرم الضيافة النادر، وهي وجهة مثالية لشهر العسل أو لعطلة عائلية أو لفترة استجمام.",
    ),
    highlights: [
      b("Rizières d'Ubud", "حقول الأرز في أوبود"),
      b("Temples au coucher du soleil", "المعابد عند الغروب"),
      b("Plages du sud et îles voisines", "شواطئ الجنوب والجزر المجاورة"),
      b("Adresses bien-être sélectionnées", "أماكن مختارة للاسترخاء والعافية"),
    ],
    practical: [
      { label: bestPeriod, text: b("Avril à octobre", "من أبريل إلى أكتوبر") },
      {
        label: b("Vol depuis le Maroc", "الرحلة من المغرب"),
        text: b("Avec escale", "مع توقف"),
      },
      {
        label: b("Monnaie", "العملة"),
        text: b("Roupie indonésienne (IDR)", "الروبية الإندونيسية (IDR)"),
      },
    ],
    faqs: [
      {
        q: b("Bali convient-il aux familles ?", "هل بالي مناسبة للعائلات؟"),
        a: b(
          "Oui. Nous adaptons le rythme, les hébergements et les activités à la composition du groupe.",
          "نعم، نكيّف الإيقاع والإقامة والأنشطة بحسب تركيبة المجموعة.",
        ),
      },
      {
        q: b("Peut-on combiner Bali avec une autre île ?", "هل يمكن الجمع بين بالي وجزيرة أخرى؟"),
        a: b(
          "C'est possible. Parlons-en pour construire l'itinéraire qui vous ressemble.",
          "ممكن، فلنتحدث معًا لبناء مسار يناسبكم.",
        ),
      },
    ],
    cover: "bali",
    gallery: ["bali", "gallery-6", "gallery-1", "gallery-3"],
    featured: true,
  },

  /* ---------------------------------- Omra ---------------------------------- */
  {
    slug: "la-mecque-medine",
    universe: "omra",
    emoji: "🕋",
    name: b("La Mecque et Médine", "مكة المكرمة والمدينة المنورة"),
    tagline: b("Voyage spirituel", "رحلة روحانية"),
    teaser: b(
      "Un séjour spirituel organisé avec soin, du départ au retour.",
      "رحلة روحانية منظّمة بعناية، من الانطلاق إلى العودة.",
    ),
    intro: b(
      "La Mecque et Médine, avec un accompagnement pensé pour que vous puissiez vous consacrer entièrement à votre voyage spirituel.",
      "مكة المكرمة والمدينة المنورة، مع مرافقة مدروسة تتيح لكم التفرغ تمامًا لرحلتكم الروحانية.",
    ),
    highlights: [
      b("Accompagnement du départ au retour", "مرافقة من الانطلاق إلى العودة"),
      b("Organisation complète du séjour", "تنظيم كامل للإقامة"),
      b("Hébergement sélectionné", "إقامة مختارة"),
      b("Transferts et assistance sur place", "تنقلات ومساعدة في عين المكان"),
    ],
    practical: [
      {
        label: b("Périodes de départ", "فترات الانطلاق"),
        text: b(
          "Plusieurs départs dans l'année : consultez le calendrier",
          "عدة رحلات خلال السنة، اطلعوا على جدول الرحلات",
        ),
      },
      {
        label: b("Durée", "المدة"),
        text: b("Selon la formule choisie", "حسب الصيغة المختارة"),
      },
      {
        label: b("Formalités", "الإجراءات"),
        text: b("Accompagnement dans les démarches", "مرافقة في الإجراءات الإدارية"),
      },
    ],
    faqs: [
      {
        q: b("Quelles formules proposez-vous ?", "ما هي الصيغ المتوفرة؟"),
        a: b(
          "Plusieurs formules existent selon la durée et l'hébergement. Les détails sont confirmés par l'agence.",
          "تتوفر عدة صيغ حسب المدة والإقامة، وتؤكد الوكالة التفاصيل.",
        ),
      },
      {
        q: b("Un accompagnateur est-il présent ?", "هل يوجد مرافق مع المجموعة؟"),
        a: b(
          "L'accompagnement fait partie intégrante de notre organisation. Contactez-nous pour les modalités.",
          "المرافقة جزء أساسي من تنظيمنا، تواصلوا معنا لمعرفة التفاصيل.",
        ),
      },
    ],
    cover: "omra",
    gallery: ["omra", "gallery-4", "gallery-5", "gallery-2"],
    featured: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Voyages                                                                     */
/* -------------------------------------------------------------------------- */

export type DemoDay = { label: Bi; title: Bi; body: Bi };

export type DemoDeparture = {
  /** Décalage en jours par rapport à aujourd'hui (négatif = départ passé). */
  offset: number;
  city: Bi;
  meeting?: Bi;
  priceMad: number | null;
  childPriceMad?: number | null;
  seatsTotal: number;
  seatsLeft: number;
  note?: Bi;
};

export type DemoTrip = {
  slug: string;
  destination: string;
  title: Bi;
  teaser: Bi;
  presentation: Bi;
  durationDays: number | null;
  durationNights: number | null;
  /** Durée réelle utilisée pour calculer la date de fin des départs. */
  spanDays: number;
  priceFromMad: number | null;
  cover?: AssetKey;
  highlights: Bi[];
  program: DemoDay[];
  included: Bi[];
  excluded: Bi[];
  faqs: DemoFaq[];
  gallery: AssetKey[];
  featured: boolean;
  departures: DemoDeparture[];
};

const casablanca = b("Casablanca", "الدار البيضاء");
const rabat = b("Rabat", "الرباط");
const meetingCasa = b("Gare routière Ouled Ziane", "المحطة الطرقية أولاد زيان");
const meetingRabat = b("Gare routière de Rabat", "المحطة الطرقية بالرباط");

const day = (label: Bi, title: Bi, body: Bi): DemoDay => ({ label, title, body });
const d1 = b("Jour 1", "اليوم 1");
const d2 = b("Jour 2", "اليوم 2");
const d3 = b("Jour 3", "اليوم 3");
const d4 = b("Jour 4", "اليوم 4");
const d5 = b("Jour 5", "اليوم 5");

const commonExcluded = {
  personal: b("Dépenses personnelles", "المصاريف الشخصية"),
  insurance: b("Assurance voyage", "التأمين على السفر"),
  meals: b("Repas non mentionnés", "الوجبات غير المذكورة"),
  optional: b("Activités optionnelles", "الأنشطة الاختيارية"),
};

const commonIncluded = {
  organisation: b("Organisation complète du séjour", "تنظيم كامل للرحلة"),
  transfers: b("Transferts", "التنقلات"),
  accommodation: b("Hébergement", "الإقامة"),
  assistance: b("Assistance de l'agence", "مساعدة الوكالة"),
};

export const demoTrips: DemoTrip[] = [
  /* -------------------------------- Maroc ----------------------------------- */
  {
    slug: "weekend-chefchaouen-akchour",
    destination: "nord",
    title: b("Week-end Chefchaouen et Akchour", "عطلة نهاية الأسبوع في شفشاون وأقشور"),
    teaser: b(
      "Deux jours entre la médina bleue et les cascades d'Akchour.",
      "يومان بين المدينة الزرقاء وشلالات أقشور.",
    ),
    presentation: b(
      "Un week-end au départ de Casablanca et de Rabat : découverte de la médina bleue de Chefchaouen le premier jour, puis randonnée vers les cascades d'Akchour le lendemain, avec retour en fin de journée.",
      "عطلة نهاية أسبوع انطلاقًا من الدار البيضاء والرباط: اكتشاف المدينة الزرقاء في شفشاون في اليوم الأول، ثم مسار مشي نحو شلالات أقشور في اليوم الموالي، مع العودة في نهاية اليوم.",
    ),
    durationDays: 2,
    durationNights: 1,
    spanDays: 2,
    priceFromMad: 650,
    highlights: [
      b("Médina bleue", "المدينة الزرقاء"),
      b("Cascades d'Akchour", "شلالات أقشور"),
      b("Nuit en maison d'hôtes", "المبيت في دار ضيافة"),
      b("Transport en autocar confortable", "النقل بحافلة مريحة"),
    ],
    program: [
      day(
        d1,
        b("Route vers Chefchaouen", "الطريق إلى شفشاون"),
        b(
          "Départ le matin, arrivée en début d'après-midi, balade dans la médina bleue et installation en maison d'hôtes.",
          "الانطلاق صباحًا والوصول بعد الزوال، ثم جولة في المدينة الزرقاء والاستقرار في دار الضيافة.",
        ),
      ),
      day(
        d2,
        b("Akchour et retour", "أقشور والعودة"),
        b(
          "Randonnée vers le Pont de Dieu et les cascades, déjeuner puis retour en fin d'après-midi.",
          "مسار مشي نحو قنطرة الله والشلالات، ثم الغداء والعودة في نهاية فترة ما بعد الزوال.",
        ),
      ),
    ],
    included: [
      b("Transport aller-retour en autocar", "النقل ذهابًا وإيابًا بالحافلة"),
      b("Une nuit en maison d'hôtes", "ليلة واحدة في دار ضيافة"),
      b("Petit-déjeuner", "وجبة الفطور"),
      b("Accompagnateur de l'agence", "مرافق من الوكالة"),
    ],
    excluded: [
      b("Déjeuners et dîners", "وجبتا الغداء والعشاء"),
      commonExcluded.personal,
      b("Pourboires", "الإكراميات"),
      commonExcluded.insurance,
    ],
    faqs: [
      {
        q: b("Quel est le point de départ ?", "من أين تنطلق الرحلة؟"),
        a: b(
          "Casablanca ou Rabat, selon la date. Le lieu de rendez-vous exact est précisé pour chaque départ.",
          "من الدار البيضاء أو الرباط حسب التاريخ، ويُحدَّد مكان اللقاء بدقة لكل رحلة.",
        ),
      },
      {
        q: b("Ce week-end convient-il aux débutants ?", "هل هذه الرحلة مناسبة للمبتدئين؟"),
        a: b(
          "Oui, la randonnée est accessible à la plupart des participants.",
          "نعم، المسار في متناول معظم المشاركين.",
        ),
      },
    ],
    gallery: [],
    featured: true,
    departures: [
      {
        offset: -10,
        city: casablanca,
        meeting: meetingCasa,
        priceMad: 650,
        seatsTotal: 30,
        seatsLeft: 4,
      },
      {
        offset: 7,
        city: casablanca,
        meeting: meetingCasa,
        priceMad: 650,
        seatsTotal: 30,
        seatsLeft: 12,
      },
      {
        offset: 14,
        city: rabat,
        meeting: meetingRabat,
        priceMad: 650,
        seatsTotal: 30,
        seatsLeft: 0,
        note: b("Départ complet.", "الرحلة مكتملة."),
      },
      {
        offset: 35,
        city: casablanca,
        meeting: meetingCasa,
        priceMad: 690,
        seatsTotal: 30,
        seatsLeft: 24,
      },
    ],
  },
  {
    slug: "merzouga-nuit-etoiles",
    destination: "sud-desert",
    title: b("Merzouga, nuit sous les étoiles", "مرزوكة، ليلة تحت النجوم"),
    teaser: b(
      "Dunes de l'Erg Chebbi et bivouac dans le désert.",
      "كثبان عرق الشبي ومبيت في مخيم بالصحراء.",
    ),
    presentation: b(
      "Quatre jours pour rejoindre Merzouga, monter à dos de dromadaire jusqu'au bivouac et passer une nuit sous un ciel étoilé, avec des étapes dans les vallées et les kasbahs du Sud.",
      "أربعة أيام للوصول إلى مرزوكة وركوب الجمال نحو المخيم وقضاء ليلة تحت سماء مرصّعة بالنجوم، مع محطات في الوديان والقصبات بالجنوب.",
    ),
    durationDays: 4,
    durationNights: 3,
    spanDays: 4,
    priceFromMad: 1900,
    highlights: [
      b("Bivouac dans les dunes", "مخيم وسط الكثبان"),
      b("Balade à dos de dromadaire", "جولة على ظهر الجمل"),
      b("Kasbahs et palmeraies", "قصبات وواحات نخيل"),
      b("Dîner et musique sous les étoiles", "عشاء وموسيقى تحت النجوم"),
    ],
    program: [
      day(
        d1,
        b("Vers le Moyen Atlas", "نحو الأطلس المتوسط"),
        b(
          "Départ matinal, traversée d'Ifrane et de ses forêts de cèdres, nuit à Midelt ou Errachidia.",
          "انطلاقة صباحية مرورًا بإفران وغابات الأرز، والمبيت في ميدلت أو الرشيدية.",
        ),
      ),
      day(
        d2,
        b("Erg Chebbi", "عرق الشبي"),
        b(
          "Arrivée à Merzouga, départ en dromadaire au coucher du soleil, dîner et nuit au bivouac.",
          "الوصول إلى مرزوكة، ثم الانطلاق على ظهر الجمال عند الغروب، والعشاء والمبيت في المخيم.",
        ),
      ),
      day(
        d3,
        b("Gorges du Todgha et Ouarzazate", "مضايق تودغى وورزازات"),
        b(
          "Lever de soleil sur les dunes, route par les gorges du Todgha, nuit à Ouarzazate.",
          "شروق الشمس على الكثبان، ثم الطريق عبر مضايق تودغى والمبيت في ورزازات.",
        ),
      ),
      day(
        d4,
        b("Retour", "العودة"),
        b(
          "Traversée du Haut Atlas par Marrakech, retour en soirée.",
          "عبور الأطلس الكبير مرورًا بمراكش، والعودة مساءً.",
        ),
      ),
    ],
    included: [
      b("Transport en minibus ou autocar", "النقل بحافلة صغيرة أو كبيرة"),
      b("3 nuits dont une en bivouac", "3 ليالٍ منها ليلة في المخيم"),
      b("Petits-déjeuners et dîners", "وجبات الفطور والعشاء"),
      b("Balade en dromadaire", "جولة على ظهر الجمل"),
    ],
    excluded: [
      b("Déjeuners", "وجبات الغداء"),
      b("Boissons", "المشروبات"),
      commonExcluded.personal,
      commonExcluded.insurance,
    ],
    faqs: [
      {
        q: b("Les nuits sont-elles froides ?", "هل تكون الليالي باردة؟"),
        a: b(
          "Oui, surtout en hiver : prévoyez des vêtements chauds.",
          "نعم، خصوصًا في الشتاء، لذا أحضروا ملابس دافئة.",
        ),
      },
      {
        q: b("Le bivouac est-il confortable ?", "هل المخيم مريح؟"),
        a: b(
          "Les tentes sont équipées de lits et de couvertures ; les sanitaires sont partagés.",
          "الخيام مجهزة بأسرّة وأغطية، والمرافق الصحية مشتركة.",
        ),
      },
    ],
    gallery: [],
    featured: true,
    departures: [
      {
        offset: 21,
        city: casablanca,
        meeting: meetingCasa,
        priceMad: 1900,
        childPriceMad: 1500,
        seatsTotal: 16,
        seatsLeft: 9,
      },
      {
        offset: 60,
        city: rabat,
        meeting: meetingRabat,
        priceMad: 1900,
        childPriceMad: 1500,
        seatsTotal: 16,
        seatsLeft: 16,
      },
    ],
  },
  {
    slug: "cascades-ouzoud",
    destination: "montagnes-atlas",
    title: b("Cascades d'Ouzoud", "شلالات أوزود"),
    teaser: b("Une journée aux plus belles cascades du Maroc.", "يوم واحد عند أجمل شلالات المغرب."),
    presentation: b(
      "Sortie à la journée depuis Casablanca : promenade le long des cascades, balade en barque au pied des chutes et déjeuner face au panorama.",
      "رحلة ليوم واحد انطلاقًا من الدار البيضاء: نزهة على طول الشلالات، وجولة بالقارب عند سفحها، وغداء أمام المنظر الطبيعي.",
    ),
    durationDays: 1,
    durationNights: null,
    spanDays: 1,
    priceFromMad: 250,
    highlights: [
      b("Chutes de 110 mètres", "شلالات يبلغ علوها 110 أمتار"),
      b("Balade en barque", "جولة بالقارب"),
      b("Singes magots en liberté", "قرود المكاك الحرة"),
      b("Déjeuner panoramique", "غداء بإطلالة بانورامية"),
    ],
    program: [
      day(
        d1,
        b("Journée à Ouzoud", "يوم في أوزود"),
        b(
          "Départ à l'aube, arrivée en fin de matinée, marche autour des cascades, déjeuner puis retour.",
          "الانطلاق عند الفجر والوصول قبيل الزوال، ثم المشي حول الشلالات والغداء والعودة.",
        ),
      ),
    ],
    included: [
      b("Transport aller-retour", "النقل ذهابًا وإيابًا"),
      b("Accompagnateur de l'agence", "مرافق من الوكالة"),
      b("Guide local", "مرشد محلي"),
    ],
    excluded: [
      b("Déjeuner", "وجبة الغداء"),
      b("Balade en barque (en option)", "الجولة بالقارب (اختيارية)"),
      commonExcluded.personal,
    ],
    faqs: [
      {
        q: b("Combien de temps dure la sortie ?", "كم تدوم الرحلة؟"),
        a: b(
          "Une journée complète, avec un départ très tôt le matin.",
          "يوم كامل مع انطلاقة مبكرة جدًا في الصباح.",
        ),
      },
      {
        q: b("Peut-on se baigner ?", "هل يمكن السباحة؟"),
        a: b(
          "Oui, aux endroits autorisés et selon le débit de l'eau.",
          "نعم، في الأماكن المسموح بها وحسب منسوب المياه.",
        ),
      },
    ],
    gallery: [],
    featured: false,
    departures: [
      {
        offset: 7,
        city: casablanca,
        meeting: meetingCasa,
        priceMad: 250,
        seatsTotal: 50,
        seatsLeft: 18,
      },
      {
        offset: 21,
        city: rabat,
        meeting: meetingRabat,
        priceMad: 250,
        seatsTotal: 50,
        seatsLeft: 33,
      },
      {
        offset: 35,
        city: casablanca,
        meeting: meetingCasa,
        priceMad: 250,
        seatsTotal: 50,
        seatsLeft: 50,
      },
    ],
  },
  {
    slug: "imlil-toubkal",
    destination: "montagnes-atlas",
    title: b("Imlil et Toubkal", "إمليل وتوبقال"),
    teaser: b(
      "L'ascension du plus haut sommet d'Afrique du Nord, en deux jours.",
      "صعود أعلى قمة في شمال إفريقيا في يومين.",
    ),
    presentation: b(
      "Départ d'Imlil avec un guide de montagne : nuit au refuge du Toubkal, puis ascension du sommet (4 167 m) et descente le lendemain. Une bonne condition physique est nécessaire.",
      "انطلاقة من إمليل برفقة مرشد جبلي: مبيت في ملجأ توبقال ثم صعود القمة (4167 مترًا) والنزول في اليوم الموالي. اللياقة البدنية الجيدة ضرورية.",
    ),
    durationDays: 2,
    durationNights: null,
    spanDays: 2,
    priceFromMad: null,
    highlights: [
      b("Sommet du Toubkal à 4 167 m", "قمة توبقال على ارتفاع 4167 مترًا"),
      b("Guide de montagne diplômé", "مرشد جبلي معتمد"),
      b("Nuit en refuge", "المبيت في الملجأ"),
      b("Panorama sur l'Atlas", "إطلالة بانورامية على الأطلس"),
    ],
    program: [
      day(
        d1,
        b("Imlil – Refuge", "إمليل – الملجأ"),
        b(
          "Montée par la vallée jusqu'au refuge (environ 5 h de marche), dîner et nuit.",
          "الصعود عبر الوادي إلى الملجأ (حوالي 5 ساعات من المشي)، ثم العشاء والمبيت.",
        ),
      ),
      day(
        d2,
        b("Sommet et descente", "القمة والنزول"),
        b(
          "Départ avant l'aube vers le sommet, puis descente vers Imlil dans la journée.",
          "الانطلاق قبل الفجر نحو القمة، ثم النزول إلى إمليل خلال اليوم.",
        ),
      ),
    ],
    included: [
      b("Guide de montagne", "مرشد جبلي"),
      b("Nuit et dîner au refuge", "المبيت والعشاء في الملجأ"),
      b("Muletier pour les bagages", "بغّال لحمل الأمتعة"),
      b("Transport depuis Casablanca ou Rabat", "النقل انطلاقًا من الدار البيضاء أو الرباط"),
    ],
    excluded: [
      b("Équipement personnel", "التجهيزات الشخصية"),
      b("Déjeuners", "وجبات الغداء"),
      b("Pourboires", "الإكراميات"),
      commonExcluded.insurance,
    ],
    faqs: [
      {
        q: b("Faut-il de l'expérience ?", "هل يلزم أن تكون لدي خبرة؟"),
        a: b(
          "Pas d'expérience alpine, mais une bonne condition physique est nécessaire.",
          "لا تلزم خبرة في التسلق، لكن اللياقة البدنية الجيدة ضرورية.",
        ),
      },
      {
        q: b("Que faut-il emporter ?", "ماذا يجب أن أحمل؟"),
        a: b(
          "Chaussures de marche, vêtements chauds, lampe frontale et sac de couchage.",
          "حذاء للمشي وملابس دافئة ومصباح للرأس وكيس نوم.",
        ),
      },
    ],
    gallery: [],
    featured: false,
    departures: [
      {
        offset: 14,
        city: casablanca,
        meeting: meetingCasa,
        priceMad: null,
        seatsTotal: 12,
        seatsLeft: 7,
      },
      {
        offset: 35,
        city: rabat,
        meeting: meetingRabat,
        priceMad: null,
        seatsTotal: 12,
        seatsLeft: 12,
      },
    ],
  },

  /* ----------------------------- International ------------------------------ */
  {
    slug: "istanbul-cappadoce",
    destination: "turquie",
    title: b("Istanbul et Cappadoce", "إسطنبول وكبادوكيا"),
    teaser: b(
      "Deux visages de la Turquie : l'effervescence d'Istanbul et le silence minéral de la Cappadoce.",
      "وجهان لتركيا: صخب إسطنبول وهدوء كبادوكيا الصخري.",
    ),
    presentation: b(
      "Un itinéraire pensé pour prendre le temps : les grands incontournables, mais aussi des moments plus calmes, loin des circuits saturés. Chaque étape est organisée à l'avance pour que vous n'ayez qu'à profiter.",
      "مسار مصمَّم لأخذ الوقت الكافي: أهم المعالم السياحية، ولكن أيضًا لحظات أكثر هدوءًا بعيدًا عن الجولات المزدحمة. تُنظَّم كل مرحلة مسبقًا حتى لا يبقى لكم سوى الاستمتاع.",
    ),
    durationDays: null,
    durationNights: null,
    spanDays: 5,
    priceFromMad: 9900,
    cover: "turquie",
    highlights: [
      b("Vol et transferts organisés", "تنظيم الرحلات الجوية والتنقلات"),
      b("Hébergements sélectionnés", "إقامات مختارة"),
      b(
        "Programme équilibré entre visites et temps libre",
        "برنامج متوازن بين الزيارات والوقت الحر",
      ),
      b("Accompagnement avant et pendant le séjour", "مرافقة قبل الرحلة وأثناءها"),
    ],
    program: [
      day(
        d1,
        b("Arrivée à Istanbul", "الوصول إلى إسطنبول"),
        b(
          "Accueil, transfert et installation. Première découverte du quartier historique.",
          "الاستقبال والتنقل إلى الفندق والاستقرار، مع أول اكتشاف للحي التاريخي.",
        ),
      ),
      day(
        d2,
        b("Istanbul historique", "إسطنبول التاريخية"),
        b(
          "Sainte-Sophie, Mosquée Bleue, Grand Bazar et croisière sur le Bosphore.",
          "آيا صوفيا والمسجد الأزرق والبازار الكبير ورحلة بحرية في البوسفور.",
        ),
      ),
      day(
        d3,
        b("Cap sur la Cappadoce", "التوجه نحو كبادوكيا"),
        b(
          "Transfert et installation, découverte des villages troglodytes.",
          "التنقل والاستقرار، واكتشاف القرى المنحوتة في الصخر.",
        ),
      ),
      day(
        d4,
        b("Vallées et lever de soleil", "الوديان وشروق الشمس"),
        b("Matinée panoramique, après-midi libre.", "صباح بانورامي وفترة ما بعد الزوال حرة."),
      ),
      day(
        d5,
        b("Retour", "العودة"),
        b("Transfert et vol retour.", "التنقل والرحلة الجوية للعودة."),
      ),
    ],
    included: [
      commonIncluded.organisation,
      b("Transferts aéroport", "التنقل من وإلى المطار"),
      commonIncluded.accommodation,
      commonIncluded.assistance,
    ],
    excluded: [
      commonExcluded.personal,
      commonExcluded.optional,
      commonExcluded.meals,
      commonExcluded.insurance,
    ],
    faqs: [
      {
        q: b("Le programme est-il modifiable ?", "هل يمكن تعديل البرنامج؟"),
        a: b(
          "Oui, chaque voyage peut être adapté à vos envies et à votre rythme.",
          "نعم، يمكن تكييف كل رحلة مع رغباتكم وإيقاعكم.",
        ),
      },
      {
        q: b("Comment réserver ?", "كيف يمكنني الحجز؟"),
        a: b(
          "Contactez-nous par WhatsApp : nous revenons vers vous avec une proposition.",
          "تواصلوا معنا عبر واتساب وسنعود إليكم بعرض مناسب.",
        ),
      },
    ],
    gallery: ["turquie", "gallery-2", "gallery-5", "gallery-3"],
    featured: true,
    departures: [{ offset: 60, city: casablanca, priceMad: 9900, seatsTotal: 30, seatsLeft: 14 }],
  },
  {
    slug: "egypte-eternelle",
    destination: "egypte",
    title: b("Égypte éternelle", "مصر الخالدة"),
    teaser: b(
      "Le Caire, Louxor et la vallée du Nil, sur les traces des pharaons.",
      "القاهرة والأقصر ووادي النيل على خطى الفراعنة.",
    ),
    presentation: b(
      "Un voyage dans le temps, organisé avec soin : sites majeurs, transferts fluides et moments de calme au bord du Nil.",
      "رحلة عبر الزمن منظّمة بعناية: مواقع كبرى وتنقلات سلسة ولحظات هدوء على ضفاف النيل.",
    ),
    durationDays: null,
    durationNights: null,
    spanDays: 7,
    priceFromMad: null,
    cover: "egypte",
    highlights: [
      b("Pyramides de Gizeh", "أهرامات الجيزة"),
      b("Musée du Caire", "متحف القاهرة"),
      b("Louxor et Assouan", "الأقصر وأسوان"),
      b("Extension mer Rouge possible", "إمكانية تمديد الرحلة إلى البحر الأحمر"),
    ],
    program: [
      day(
        d1,
        b("Arrivée au Caire", "الوصول إلى القاهرة"),
        b("Accueil, transfert et installation.", "الاستقبال والتنقل والاستقرار."),
      ),
      day(
        b("Jours 2-3", "اليومان 2-3"),
        b("Le Caire", "القاهرة"),
        b("Gizeh, Saqqarah et musée national.", "الجيزة وسقارة والمتحف الوطني."),
      ),
      day(
        b("Jours 4-6", "الأيام 4-6"),
        b("Vallée du Nil", "وادي النيل"),
        b("Louxor, Assouan et temples.", "الأقصر وأسوان والمعابد."),
      ),
      day(
        b("Jour 7", "اليوم 7"),
        b("Retour", "العودة"),
        b("Transfert et vol retour.", "التنقل والرحلة الجوية للعودة."),
      ),
    ],
    included: [
      b("Organisation du séjour", "تنظيم الرحلة"),
      commonIncluded.transfers,
      commonIncluded.accommodation,
      commonIncluded.assistance,
    ],
    excluded: [
      commonExcluded.personal,
      commonExcluded.optional,
      commonExcluded.meals,
      commonExcluded.insurance,
    ],
    faqs: [
      {
        q: b("Voyage adapté aux familles ?", "هل الرحلة مناسبة للعائلات؟"),
        a: b(
          "Oui, le rythme peut être ajusté selon l'âge des voyageurs.",
          "نعم، يمكن تعديل الإيقاع حسب أعمار المسافرين.",
        ),
      },
      {
        q: b("Guide francophone ?", "هل يتوفر مرشد ناطق بالفرنسية؟"),
        a: b(
          "Nous étudions cette option selon la période et la formule.",
          "ندرس هذا الخيار حسب الفترة والصيغة.",
        ),
      },
    ],
    gallery: ["egypte", "gallery-2", "gallery-1", "gallery-5"],
    featured: true,
    departures: [{ offset: 60, city: casablanca, priceMad: null, seatsTotal: 25, seatsLeft: 25 }],
  },
  {
    slug: "evasion-balinaise",
    destination: "bali",
    title: b("Évasion balinaise", "رحلة الاسترخاء في بالي"),
    teaser: b(
      "Rizières, temples et plages, dans un rythme volontairement lent.",
      "حقول أرز ومعابد وشواطئ بإيقاع بطيء مقصود.",
    ),
    presentation: b(
      "Un séjour conçu comme une respiration : le nord verdoyant d'Ubud, puis les plages du sud. Hébergements choisis pour leur caractère et leur qualité de service.",
      "إقامة مصمَّمة كاستراحة للروح: شمال أوبود الأخضر ثم شواطئ الجنوب، مع فنادق مختارة لطابعها وجودة خدمتها.",
    ),
    durationDays: null,
    durationNights: null,
    spanDays: 8,
    priceFromMad: null,
    cover: "bali",
    highlights: [
      b("Ubud et ses rizières", "أوبود وحقول الأرز"),
      b("Temples au coucher du soleil", "المعابد عند الغروب"),
      b("Plages et îles voisines", "الشواطئ والجزر المجاورة"),
      b("Adresses bien-être sélectionnées", "أماكن مختارة للاسترخاء والعافية"),
    ],
    program: [
      day(
        d1,
        b("Arrivée à Bali", "الوصول إلى بالي"),
        b("Accueil et transfert vers votre hébergement.", "الاستقبال والتنقل إلى مكان الإقامة."),
      ),
      day(
        b("Jours 2-4", "الأيام 2-4"),
        b("Ubud", "أوبود"),
        b(
          "Rizières, artisanat, temples et nature.",
          "حقول الأرز والحرف التقليدية والمعابد والطبيعة.",
        ),
      ),
      day(
        b("Jours 5-7", "الأيام 5-7"),
        b("Sud de l'île", "جنوب الجزيرة"),
        b("Plages, couchers de soleil et temps libre.", "شواطئ وغروب الشمس ووقت حر."),
      ),
      day(
        b("Jour 8", "اليوم 8"),
        b("Retour", "العودة"),
        b("Transfert et vol retour.", "التنقل والرحلة الجوية للعودة."),
      ),
    ],
    included: [
      b("Organisation du séjour", "تنظيم الرحلة"),
      commonIncluded.transfers,
      commonIncluded.accommodation,
      commonIncluded.assistance,
    ],
    excluded: [
      b("Vols internationaux selon la formule", "الرحلات الجوية الدولية حسب الصيغة"),
      commonExcluded.meals,
      commonExcluded.optional,
      commonExcluded.insurance,
    ],
    faqs: [
      {
        q: b("Voyage de noces possible ?", "هل يمكن تنظيم رحلة شهر العسل؟"),
        a: b(
          "Oui, nous pouvons composer un séjour spécifiquement pensé pour cela.",
          "نعم، يمكننا تصميم إقامة مخصصة لذلك.",
        ),
      },
      {
        q: b("Quel budget prévoir ?", "ما الميزانية المتوقعة؟"),
        a: b(
          "Le budget dépend de la saison et des hébergements. Demandez un devis personnalisé.",
          "تختلف الميزانية حسب الموسم والإقامة، اطلبوا عرضًا مخصصًا.",
        ),
      },
    ],
    gallery: ["bali", "gallery-6", "gallery-1", "gallery-3"],
    featured: false,
    departures: [{ offset: 60, city: casablanca, priceMad: null, seatsTotal: 20, seatsLeft: 20 }],
  },

  /* ---------------------------------- Omra ---------------------------------- */
  {
    slug: "omra-15-jours",
    destination: "la-mecque-medine",
    title: b("Omra 15 jours", "عمرة 15 يومًا"),
    teaser: b(
      "Un séjour spirituel organisé dans les moindres détails.",
      "رحلة روحانية منظّمة بأدق التفاصيل.",
    ),
    presentation: b(
      "Parce qu'un voyage spirituel mérite une organisation à la hauteur de son importance : démarches, transport, hébergement et assistance sont pris en charge par l'agence.",
      "لأن الرحلة الروحانية تستحق تنظيمًا يليق بأهميتها: تتكفل الوكالة بالإجراءات والنقل والإقامة والمساعدة.",
    ),
    durationDays: 15,
    durationNights: 14,
    spanDays: 15,
    priceFromMad: 17500,
    cover: "omra",
    highlights: [
      b("Accompagnement humain", "مرافقة إنسانية"),
      b("Organisation complète", "تنظيم كامل"),
      b("Hébergement sélectionné", "إقامة مختارة"),
      b("Assistance sur place", "مساعدة في عين المكان"),
    ],
    program: [
      day(
        b("Étape 1", "المرحلة 1"),
        b("Préparation", "التحضير"),
        b(
          "Accompagnement dans les démarches et informations pratiques.",
          "مرافقة في الإجراءات ومعلومات عملية.",
        ),
      ),
      day(
        b("Étape 2", "المرحلة 2"),
        b("Départ", "الانطلاق"),
        b("Transferts et vol organisés.", "تنظيم التنقلات والرحلة الجوية."),
      ),
      day(
        b("Étape 3", "المرحلة 3"),
        b("Séjour", "الإقامة"),
        b("Programme et assistance sur place.", "برنامج ومساعدة في عين المكان."),
      ),
      day(
        b("Étape 4", "المرحلة 4"),
        b("Retour", "العودة"),
        b("Transferts et retour organisés.", "تنظيم التنقلات والعودة."),
      ),
    ],
    included: [
      b("Organisation du séjour", "تنظيم الرحلة"),
      commonIncluded.transfers,
      commonIncluded.accommodation,
      commonIncluded.assistance,
    ],
    excluded: [
      commonExcluded.personal,
      commonExcluded.meals,
      commonExcluded.insurance,
      b("Options complémentaires", "خيارات إضافية"),
    ],
    faqs: [
      {
        q: b("Quelles sont les formules disponibles ?", "ما هي الصيغ المتوفرة؟"),
        a: b(
          "Plusieurs formules existent. Les détails précis sont confirmés directement par l'agence.",
          "تتوفر عدة صيغ، وتؤكد الوكالة التفاصيل الدقيقة مباشرة.",
        ),
      },
      {
        q: b("Comment obtenir les informations ?", "كيف أحصل على المعلومات؟"),
        a: b("Par WhatsApp, avec un message prérempli.", "عبر واتساب برسالة جاهزة."),
      },
    ],
    gallery: ["omra", "gallery-4", "gallery-5", "gallery-2"],
    featured: true,
    departures: [
      { offset: 35, city: casablanca, priceMad: 17500, seatsTotal: 40, seatsLeft: 11 },
      { offset: 60, city: casablanca, priceMad: 17500, seatsTotal: 40, seatsLeft: 27 },
    ],
  },
];
