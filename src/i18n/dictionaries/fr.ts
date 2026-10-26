/**
 * Dictionnaire français : source de vérité des textes d'interface publics.
 * `ar.ts` est typé sur la même forme (`Dict`) : TypeScript impose une traduction arabe complète.
 */

/** Même forme que le dictionnaire, avec des `string` à la place des littéraux. */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T;

export const fr = {
  meta: {
    siteName: "Hakim Travels",
    baseline: "Agence de voyage",
    defaultTitle: "Hakim Travels | Agence de voyage au Maroc",
    defaultDescription:
      "Hakim Travels organise vos escapades au Maroc, vos voyages internationaux et vos Omra : départs datés, accompagnement humain et réservation simple par WhatsApp.",
    home: {
      title: null,
      description:
        "Escapades au Maroc, voyages internationaux et Omra : découvrez les prochains départs Hakim Travels et réservez simplement par WhatsApp.",
    },
    maroc: {
      title: "Voyages au Maroc",
      description:
        "Nord, Sud et désert, montagnes de l'Atlas, côte atlantique : week-ends et circuits au Maroc avec des départs datés, organisés par Hakim Travels.",
    },
    international: {
      title: "Voyages internationaux",
      description:
        "Turquie, Égypte, Bali et d'autres destinations : des voyages internationaux organisés avec soin, au départ du Maroc.",
    },
    omra: {
      title: "Omra",
      description:
        "Une Omra pensée dans les moindres détails : accompagnement, organisation, hébergement, transport et assistance avec Hakim Travels.",
    },
    departures: {
      title: "Prochains départs",
      description:
        "Toutes les dates de départ à venir : Maroc, international et Omra. Choisissez votre date et réservez par WhatsApp.",
    },
    trips: {
      title: "Nos voyages",
      description:
        "Découvrez tous les voyages Hakim Travels : escapades au Maroc, voyages internationaux et Omra, avec leurs prochains départs.",
    },
    destinations: {
      title: "Destinations",
      description:
        "Régions du Maroc, destinations internationales et Omra : explorez les destinations proposées par Hakim Travels.",
    },
    custom: {
      title: "Voyage sur mesure",
      description:
        "Construisons ensemble un voyage adapté à vos envies, votre rythme et votre budget. Demandez votre proposition personnalisée à Hakim Travels.",
    },
    contact: {
      title: "Contact",
      description:
        "Contactez Hakim Travels par WhatsApp, téléphone ou e-mail pour organiser votre prochain voyage ou votre Omra.",
    },
    about: {
      title: "À propos",
      description:
        "Hakim Travels, agence de voyage marocaine : une équipe à votre écoute et une organisation de voyages pensée pour votre sérénité.",
    },
    legal: {
      title: "Mentions légales",
      description:
        "Mentions légales du site Hakim Travels : éditeur, propriété intellectuelle et responsabilité.",
    },
    privacy: {
      title: "Politique de confidentialité",
      description:
        "Comment Hakim Travels traite vos données personnelles, conformément à la loi marocaine n° 09-08, et quels sont vos droits.",
    },
    terms: {
      title: "Conditions générales",
      description:
        "Conditions générales de réservation, de paiement, d'annulation et de responsabilité de Hakim Travels.",
    },
    notFound: { title: "Page introuvable" },
  },

  nav: {
    home: "Accueil",
    maroc: "Maroc",
    international: "International",
    omra: "Omra",
    departures: "Prochains départs",
    custom: "Sur mesure",
    contact: "Contact",
    about: "À propos",
    plan: "Planifier mon voyage",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    mainLabel: "Navigation principale",
    footerLabel: "Navigation du pied de page",
    homeLabel: "Hakim Travels, accueil",
    logoAlt: "Logo Hakim Travels",
  },

  lang: {
    fr: "Français",
    ar: "العربية",
    switchLabel: "Changer de langue",
  },

  universes: {
    maroc: "Maroc",
    international: "International",
    omra: "Omra",
    all: "Tout",
  },

  common: {
    whatsapp: "WhatsApp",
    whatsappContact: "Contacter Hakim Travels sur WhatsApp",
    writeOnWhatsapp: "Écrire sur WhatsApp",
    talkToAdvisor: "Parler à un conseiller",
    askInfo: "Demander des informations",
    reserveOnWhatsapp: "Réserver sur WhatsApp",
    seeTrip: "Voir le voyage",
    seeAll: "Tout voir",
    explore: "Explorer",
    discover: "Découvrir",
    see: "Voir",
    priceOnRequest: "Prix sur demande",
    fromPrice: "À partir de {price}",
    full: "Complet",
    seatsLeft: "Places restantes : {n}",
    childPrice: "Enfant : {price}",
    meetingPoint: "Rendez-vous : {value}",
    departFrom: "Départ de {city}",
    nextDeparture: "Prochain départ : {date}",
    departuresCount: "Départs à venir : {n}",
    tripCount: {
      one: "{n} voyage",
      two: "{n} voyages",
      few: "{n} voyages",
      many: "{n} voyages",
      other: "{n} voyages",
    },
    noDeparture: "Aucun départ programmé pour le moment.",
    noDepartureHint: "Écrivez-nous pour connaître les prochaines dates.",
    noTrip: "Aucun voyage disponible pour le moment.",
    contactUs: "Nous contacter",
    seeInstagram: "Voir notre Instagram",
    imageSoon: "Photos bientôt disponibles",
  },

  home: {
    hero: {
      badge: "{label} voyageurs nous suivent sur Instagram",
      title: "Découvrez le Maroc. Puis le monde.",
      subtitle:
        "Escapades au Maroc, voyages internationaux et Omra : des départs datés, organisés avec soin, avec un accompagnement humain du début à la fin.",
      ctaDepartures: "Voir les prochains départs",
      ctaAdvisor: "Parler à un conseiller",
      chips: {
        north: "Nord",
        south: "Sud et désert",
        mountains: "Montagnes",
        international: "International",
        omra: "Omra",
      },
    },
    regions: {
      eyebrow: "Maroc",
      title: "Le Maroc, région par région",
      subtitle:
        "Nord, Sud et désert, montagnes, côte atlantique : choisissez votre prochaine escapade.",
      cta: "Tous les voyages au Maroc",
    },
    departures: {
      eyebrow: "Calendrier",
      title: "Prochains départs",
      subtitle:
        "Des dates précises, des places limitées : réservez la vôtre en quelques clics sur WhatsApp.",
      cta: "Tous les départs",
    },
    featured: {
      eyebrow: "Sélection",
      title: "Nos voyages à la une",
      subtitle: "Des voyages choisis pour créer des souvenirs qui restent.",
    },
    international: {
      eyebrow: "International",
      title: "Une envie d'ailleurs ?",
      subtitle: "Des voyages internationaux organisés avec la même exigence, au départ du Maroc.",
      cta: "Tous les voyages internationaux",
    },
    omra: {
      eyebrow: "Omra",
      title: "Une Omra pensée dans les moindres détails.",
      text: "Parce qu'un voyage spirituel mérite une organisation à la hauteur de son importance.",
      cta: "Découvrir l'Omra",
      ask: "Demander des informations",
    },
    why: {
      eyebrow: "Notre approche",
      title: "Pourquoi voyager avec Hakim Travels ?",
      items: [
        {
          title: "Accompagnement humain",
          text: "Une équipe joignable, qui répond vraiment, avant, pendant et après le voyage.",
        },
        {
          title: "Voyages soigneusement sélectionnés",
          text: "Des destinations et des adresses choisies, pas des catalogues génériques.",
        },
        {
          title: "Organisation professionnelle",
          text: "Vols, transferts, hébergements et programme : tout est cadré en amont.",
        },
        {
          title: "Une expérience pensée pour votre sérénité",
          text: "Vous voyagez, nous nous occupons du reste. C'est le principe.",
        },
      ],
    },
    reviews: {
      eyebrow: "Avis",
      title: "Ils ont voyagé avec nous",
    },
    instagram: {
      eyebrow: "Communauté",
      title: "Voyagez avec nous",
      subtitle: "Des destinations, des départs et des souvenirs partagés au quotidien.",
      followers: "{label} abonnés",
      alts: [
        "Piscine à débordement face à l'océan au coucher du soleil",
        "Barque traditionnelle sur une mer turquoise",
        "Vue aérienne d'un littoral tropical",
        "Voyageur dans une ruelle éclairée par des lanternes",
        "Coupole verte de la mosquée du Prophète à Médine au crépuscule",
        "Petit-déjeuner sur une terrasse d'hôtel au lever du soleil",
      ],
    },
    custom: {
      eyebrow: "Sur mesure",
      title: "Votre voyage. Votre rythme. Votre histoire.",
      text: "Une destination précise en tête ? Parlons-en et construisons ensemble un voyage adapté à vos envies.",
      whatsappText:
        "Écrivez-nous sur WhatsApp : un conseiller vous répond avec une proposition adaptée.",
    },
    cta: {
      eyebrow: "Prochaine étape",
      title: "Prêt à partir ? Parlons de votre prochain voyage.",
      text: "Un conseiller vous répond et construit avec vous un voyage adapté à vos envies et à votre budget.",
    },
  },

  universePages: {
    regionsTitle: "Régions",
    tripsTitle: "Voyages",
    departuresTitle: "Prochains départs",
    maroc: {
      eyebrow: "Maroc",
      title: "Le Maroc à votre rythme",
      subtitle:
        "Week-ends, circuits et escapades en groupe : du Nord verdoyant aux dunes du Sud, des départs datés et organisés de A à Z.",
      regionsSubtitle: "Choisissez une région pour découvrir ses voyages et ses prochains départs.",
    },
    international: {
      eyebrow: "International",
      title: "Le monde, au départ du Maroc",
      subtitle:
        "Turquie, Égypte, Bali et bien d'autres : des voyages organisés avec la même exigence que chez nous.",
      regionsSubtitle:
        "Choisissez une destination pour découvrir ses voyages et ses prochains départs.",
    },
    omra: {
      eyebrow: "Voyage spirituel",
      title: "Une Omra pensée dans les moindres détails.",
      subtitle:
        "Parce qu'un voyage spirituel mérite une organisation à la hauteur de son importance.",
    },
  },

  omraPage: {
    imageAlt: "Cour de la Grande Mosquée de La Mecque à l'heure bleue",
    medinaAlt: "Coupole verte de la mosquée du Prophète à Médine au crépuscule",
    ctaInfo: "Demander des informations",
    ctaFormula: "Voir les formules",
    introTitle: "Un accompagnement complet",
    introText:
      "De la préparation administrative au retour, chaque étape est organisée pour que vous puissiez vous consacrer entièrement à votre voyage spirituel.",
    features: [
      {
        title: "Accompagnement",
        text: "Une équipe présente à chaque étape, avant le départ comme sur place.",
      },
      {
        title: "Organisation",
        text: "Démarches, planning et logistique gérés de bout en bout.",
      },
      {
        title: "Hébergement",
        text: "Hébergement sélectionné, dont les détails vous sont communiqués par l'agence.",
      },
      {
        title: "Transport",
        text: "Vols et transferts organisés selon la formule choisie.",
      },
      {
        title: "Assistance",
        text: "Un interlocuteur disponible durant tout le séjour.",
      },
    ],
    note: "Hôtels, durées, tarifs et dates : informations communiquées et confirmées directement par l'agence.",
    stepsTitle: "Le déroulement",
    steps: [
      {
        label: "Étape 1",
        title: "Préparation",
        text: "Accompagnement dans les démarches et informations pratiques avant le départ.",
      },
      { label: "Étape 2", title: "Départ", text: "Transferts et vols organisés." },
      { label: "Étape 3", title: "Séjour", text: "Programme et assistance sur place." },
      { label: "Étape 4", title: "Retour", text: "Transferts et retour organisés." },
    ],
    formulasTitle: "Nos formules",
    departuresTitle: "Prochains départs",
    faqTitle: "Questions fréquentes",
    faq: [
      {
        question: "Quelles formules proposez-vous ?",
        answer:
          "Plusieurs formules existent selon la durée et l'hébergement. Les détails sont confirmés directement par l'agence.",
      },
      {
        question: "Un accompagnateur est-il présent ?",
        answer:
          "L'accompagnement fait partie intégrante de notre organisation. Contactez-nous pour connaître les modalités.",
      },
      {
        question: "Quels documents faut-il prévoir ?",
        answer:
          "Un passeport en cours de validité et le visa nécessaire. L'agence vous guide dans les démarches et vous communique la liste exacte à l'inscription.",
      },
    ],
    askTitle: "Demander des informations",
    askText: "Écrivez-nous sur WhatsApp : un conseiller vous répond avec une proposition adaptée.",
  },

  tripsPage: {
    eyebrow: "Voyages",
    title: "Des voyages pensés jusque dans le détail",
    subtitle:
      "Chaque voyage est organisé avec soin : itinéraire, hébergement, transferts et accompagnement.",
    filterLabel: "Filtrer par univers",
    empty: "Aucun voyage ne correspond à cette sélection pour le moment.",
  },

  tripPage: {
    notFoundTitle: "Ce voyage n'existe pas",
    notFoundCta: "Voir tous nos voyages",
    presentation: "Présentation",
    highlights: "Points forts",
    program: "Programme",
    programNote: "Programme indicatif, susceptible d'ajustements.",
    included: "Ce qui est inclus",
    excluded: "Ce qui n'est pas inclus",
    gallery: "Galerie",
    faq: "Questions fréquentes",
    departures: "Prochains départs",
    departuresIntro: "Choisissez votre date et réservez votre place par WhatsApp.",
    asideEyebrow: "Demander des informations",
    asideTitle: "Ce voyage vous intéresse ?",
    asideText:
      "Écrivez-nous : nous revenons vers vous avec le programme détaillé et les disponibilités.",
    mobileInfo: "Contact",
    galleryAlt: "{title}, photo {n}",
  },

  destinationsPage: {
    eyebrow: "Destinations",
    title: "Une envie d'ailleurs ?",
    subtitle:
      "Du Maroc à l'international, en passant par l'Omra : trois univers, une même exigence d'organisation.",
    notFoundTitle: "Cette destination n'existe pas",
    notFoundCta: "Voir toutes les destinations",
    intro: "Introduction",
    highlights: "Points forts",
    gallery: "Galerie",
    trips: "Voyages disponibles",
    departures: "Prochains départs",
    practical: "Informations pratiques",
    faq: "Questions fréquentes",
  },

  departuresPage: {
    eyebrow: "Calendrier",
    title: "Prochains départs",
    subtitle: "Toutes les dates à venir. Choisissez la vôtre et réservez votre place par WhatsApp.",
    universeLabel: "Univers",
    regionLabel: "Destination",
    monthLabel: "Mois",
    allRegions: "Toutes les destinations",
    allMonths: "Tous les mois",
    empty: "Aucun départ ne correspond à cette sélection.",
    emptyHint: "Essayez un autre mois ou écrivez-nous pour connaître les prochaines dates.",
    count: {
      one: "{n} départ",
      two: "{n} départs",
      few: "{n} départs",
      many: "{n} départs",
      other: "{n} départs",
    },
    reset: "Réinitialiser les filtres",
  },

  customPage: {
    eyebrow: "Sur mesure",
    title: "Votre voyage. Votre rythme. Votre histoire.",
    subtitle:
      "Une destination précise en tête ? Parlons-en et construisons ensemble un voyage adapté à vos envies.",
    stepsTitle: "Comment ça se passe",
    steps: [
      {
        title: "Vous nous écrivez",
        text: "Dites-nous où vous rêvez d'aller, avec qui, à quelle période et avec quel budget approximatif.",
      },
      {
        title: "Nous construisons votre programme",
        text: "Un conseiller vous propose un itinéraire, des hébergements et un tarif, que nous ajustons ensemble.",
      },
      {
        title: "Vous partez sereinement",
        text: "Nous organisons les vols, les transferts et les réservations, et restons joignables avant et pendant le voyage.",
      },
    ],
    forTitle: "Pour qui ?",
    forItems: ["En couple", "En famille", "Entre amis"],
    askTitle: "Parlons de votre projet",
    askText: "Écrivez-nous sur WhatsApp : un conseiller vous répond avec une proposition adaptée.",
  },

  contactPage: {
    eyebrow: "Contact",
    title: "Parlons de votre prochain voyage.",
    subtitle: "Écrivez-nous : nous répondons rapidement, sur le canal de votre choix.",
    whatsapp: "WhatsApp",
    phone: "Téléphone",
    email: "E-mail",
    address: "Adresse",
    hours: "Horaires",
    map: "Voir sur la carte",
    askText: "Écrivez-nous sur WhatsApp : un conseiller vous répond avec une proposition adaptée.",
  },

  aboutPage: {
    eyebrow: "À propos",
    title: "Une agence née d'une communauté de voyageurs",
    subtitle:
      "Hakim Travels accompagne ses voyageurs au Maroc, à l'international et pour l'Omra, avec des départs datés et un conseiller à chaque étape.",
    approachTitle: "Notre approche",
    approachText:
      "Nous organisons des voyages que nous aurions envie de faire nous-mêmes : des itinéraires équilibrés, des hébergements choisis et un interlocuteur qui répond réellement.",
    legalTitle: "Informations légales",
    followers: "abonnés Instagram",
  },

  legalLabels: {
    company: "Raison sociale",
    ice: "ICE",
    rc: "Registre de commerce",
    license: "Licence d'agence de voyage",
    address: "Adresse",
    phone: "Téléphone",
    email: "E-mail",
  },

  legalPage: {
    eyebrow: "Informations légales",
    title: "Mentions légales",
    subtitle: "Informations sur l'éditeur du site et conditions générales d'utilisation.",
    publisherTitle: "Éditeur du site",
    publisherIntro: "Ce site est édité par l'agence de voyage Hakim Travels.",
    sections: [
      {
        title: "Propriété intellectuelle",
        paragraphs: [
          "L'ensemble des contenus de ce site (textes, photographies, logos, graphismes, structure) est protégé par la législation applicable en matière de propriété intellectuelle.",
          "Toute reproduction, représentation ou adaptation, totale ou partielle, sans l'autorisation écrite préalable de l'éditeur est interdite.",
        ],
      },
      {
        title: "Responsabilité",
        paragraphs: [
          "Les informations publiées (programmes, dates, tarifs, disponibilités) sont données à titre indicatif et peuvent évoluer. Seule la confirmation écrite de l'agence fait foi.",
          "L'éditeur s'efforce de maintenir le site accessible et ses informations exactes, sans pouvoir garantir l'absence d'erreur ou d'interruption.",
        ],
      },
      {
        title: "Liens externes",
        paragraphs: [
          "Ce site peut contenir des liens vers des sites tiers (réseaux sociaux, WhatsApp, cartographie). L'éditeur n'exerce aucun contrôle sur leur contenu et décline toute responsabilité à ce titre.",
        ],
      },
      {
        title: "Données personnelles",
        paragraphs: [
          "Le traitement des données personnelles est décrit dans la politique de confidentialité, accessible depuis le pied de page du site.",
        ],
      },
      {
        title: "Droit applicable",
        paragraphs: [
          "Le présent site et ses mentions légales sont soumis au droit marocain. En cas de litige, et à défaut de résolution amiable, les tribunaux marocains compétents seront seuls compétents.",
        ],
      },
    ],
  },

  privacyPage: {
    eyebrow: "Informations légales",
    title: "Politique de confidentialité",
    subtitle:
      "Comment nous traitons vos données personnelles, conformément à la loi marocaine n° 09-08.",
    contactTitle: "Nous contacter pour exercer vos droits",
    contactIntro:
      "Pour toute question ou demande relative à vos données personnelles, contactez-nous :",
    sections: [
      {
        title: "Responsable du traitement",
        paragraphs: [
          "Le responsable du traitement des données personnelles est l'agence Hakim Travels, dont les coordonnées figurent dans les mentions légales et sur la page de contact.",
        ],
      },
      {
        title: "Données que nous traitons",
        paragraphs: [
          "Ce site ne propose aucun formulaire et ne crée pas de compte pour les visiteurs. Nous ne collectons donc pas de données via le site lui-même.",
          "Lorsque vous nous écrivez par WhatsApp, par téléphone ou par e-mail, nous traitons les informations que vous nous communiquez : votre nom, votre numéro de téléphone, votre adresse e-mail et les détails de votre projet de voyage.",
          "Comme tout serveur web, notre hébergement conserve des journaux techniques (adresse IP, date et page consultée) nécessaires au fonctionnement et à la sécurité du site.",
        ],
      },
      {
        title: "Finalités",
        paragraphs: [
          "Vos données servent uniquement à répondre à vos demandes, à établir des propositions et des devis, à organiser et à suivre votre voyage, et à respecter nos obligations légales.",
          "Nous ne vendons pas vos données et ne les utilisons pas à des fins publicitaires sans votre accord.",
        ],
      },
      {
        title: "Destinataires",
        paragraphs: [
          "Vos données ne sont communiquées qu'aux personnes qui en ont besoin pour organiser votre voyage (équipe de l'agence, transporteurs, hébergeurs et prestataires sur place), dans la limite de ce qui est nécessaire.",
          "Les échanges par WhatsApp sont soumis aux conditions d'utilisation et à la politique de confidentialité de ce service.",
        ],
      },
      {
        title: "Cookies et services tiers",
        paragraphs: [
          "Ce site n'utilise ni cookie publicitaire ni outil de mesure d'audience. Un cookie technique n'est déposé que pour la connexion à l'espace d'administration, réservé à l'équipe de l'agence.",
          "Les polices de caractères sont chargées depuis le service Google Fonts, ce qui transmet votre adresse IP à ce prestataire.",
        ],
      },
      {
        title: "Durée de conservation",
        paragraphs: [
          "Vos données sont conservées le temps nécessaire au traitement de votre demande et à la gestion de votre voyage, puis pendant les durées imposées par la réglementation applicable. Elles sont ensuite supprimées ou anonymisées.",
        ],
      },
      {
        title: "Vos droits",
        paragraphs: [
          "Conformément à la loi n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, vous disposez d'un droit d'accès, de rectification et d'opposition, pour des motifs légitimes, au traitement de vos données.",
          "Vous pouvez exercer ces droits à tout moment en nous contactant. Vous pouvez également saisir la Commission nationale de contrôle de la protection des données à caractère personnel (CNDP) si vous estimez que vos droits ne sont pas respectés.",
        ],
      },
      {
        title: "Sécurité",
        paragraphs: [
          "Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger vos données contre la perte, l'accès non autorisé et la divulgation.",
        ],
      },
      {
        title: "Modifications",
        paragraphs: [
          "Cette politique peut être mise à jour pour refléter l'évolution de nos pratiques ou de la réglementation. La version publiée sur cette page est la version en vigueur.",
        ],
      },
    ],
  },

  termsPage: {
    eyebrow: "Informations légales",
    title: "Conditions générales",
    subtitle:
      "Les règles qui s'appliquent à la réservation et à l'organisation de vos voyages avec Hakim Travels.",
    sections: [
      {
        title: "Objet",
        paragraphs: [
          "Les présentes conditions générales encadrent les relations entre l'agence Hakim Travels et ses clients pour la vente de voyages, de séjours et de formules d'Omra proposés sur ce site.",
        ],
      },
      {
        title: "Informations et tarifs",
        paragraphs: [
          "Les programmes, dates, tarifs et disponibilités affichés sur le site sont donnés à titre indicatif. Les prix « à partir de » correspondent au tarif le plus bas connu et peuvent varier selon la date, la ville de départ et la composition du groupe.",
          "Seule l'offre confirmée par écrit par l'agence (message WhatsApp ou e-mail) a valeur d'engagement.",
        ],
      },
      {
        title: "Réservation",
        paragraphs: [
          "Il n'y a pas de réservation en ligne : toute demande passe par WhatsApp, par téléphone ou par e-mail. La réservation est ferme lorsque l'agence a confirmé la disponibilité et que le client a réglé l'acompte demandé.",
          "Les places sont attribuées dans l'ordre de confirmation. Un départ affiché comme complet n'accepte plus de réservation.",
        ],
      },
      {
        title: "Paiement",
        paragraphs: [
          "Les modalités de paiement (acompte, échéances, solde) sont communiquées par l'agence au moment de la réservation et précisées dans la confirmation écrite.",
        ],
      },
      {
        title: "Modification et annulation par le client",
        paragraphs: [
          "Toute demande de modification ou d'annulation doit être adressée à l'agence par écrit. Les frais éventuels dépendent du voyage, des prestataires concernés et du délai avant le départ ; ils sont indiqués au client avant la confirmation de sa réservation.",
        ],
      },
      {
        title: "Modification ou annulation par l'agence",
        paragraphs: [
          "Si un départ ne peut avoir lieu (nombre insuffisant de participants, force majeure, indisponibilité d'un prestataire), l'agence en informe le client dans les meilleurs délais et lui propose une autre date, un voyage équivalent ou le remboursement des sommes versées.",
        ],
      },
      {
        title: "Documents de voyage et santé",
        paragraphs: [
          "Le client est responsable de la validité de ses documents de voyage (passeport, visa, autorisations) et du respect des formalités sanitaires de la destination. L'agence l'informe des démarches usuelles sans pouvoir s'y substituer.",
          "Une assurance voyage est vivement recommandée.",
        ],
      },
      {
        title: "Responsabilité",
        paragraphs: [
          "L'agence est responsable de la bonne exécution des prestations qu'elle vend, dans les limites prévues par la loi. Elle ne saurait être tenue responsable des dommages résultant d'un cas de force majeure, du fait d'un tiers ou du fait du client.",
        ],
      },
      {
        title: "Réclamations",
        paragraphs: [
          "Toute réclamation doit être adressée à l'agence par écrit, dans un délai raisonnable après la fin du voyage, afin de permettre un traitement amiable.",
        ],
      },
      {
        title: "Droit applicable",
        paragraphs: [
          "Les présentes conditions sont soumises au droit marocain. À défaut d'accord amiable, les tribunaux marocains compétents seront seuls compétents.",
        ],
      },
    ],
  },

  footer: {
    tagline: "Voyagez avec style. Découvrez le monde.",
    navTitle: "Navigation",
    contactTitle: "Contact",
    legalTitle: "Informations légales",
    followUs: "Suivez-nous",
    legal: "Mentions légales",
    privacy: "Politique de confidentialité",
    terms: "Conditions générales",
    rights: "{name}. Tous droits réservés.",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    youtube: "YouTube",
  },

  whatsapp: {
    general: "Bonjour Hakim Travels, je souhaite des informations sur vos voyages.",
    trip: "Bonjour, je souhaite des informations sur le voyage « {trip} ». {url}",
    departure:
      "Bonjour, je souhaite réserver le voyage « {trip} » au départ de {city}, du {start} au {end} ({price}). {url}",
    omra: "Bonjour, je souhaite des informations sur l'Omra.",
    custom: "Bonjour, je souhaite organiser un voyage sur mesure.",
  },

  notFound: {
    title: "Page introuvable",
    text: "Cette page n'existe pas ou a été déplacée.",
    home: "Retour à l'accueil",
  },

  error: {
    title: "Cette page n'a pas pu se charger",
    text: "Un problème est survenu de notre côté. Vous pouvez actualiser la page ou revenir à l'accueil.",
    retry: "Réessayer",
    home: "Accueil",
  },
} as const;

export type Dict = Widen<typeof fr>;
