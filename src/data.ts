/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, BlogArticle, PromoCampaign } from "./types";
import { CLINIC_MEDIA } from "./lib/clinicMedia";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "multiman-herbal-force",
    name: "PJ Multiman Herbal Force",
    category: "Men's Health",
    price: 45000,
    originalPrice: 55000,
    images: [
      CLINIC_MEDIA.multiman
    ],
    shortBenefits: "Vitality, stamina, and reproductive health support.",
    description: "PJ Multiman Herbal Force combines traditional East African and botanical roots prepared to support daily male vitality, physical endurance, and circulation without synthetic stimulants.",
    ingredients: ["Tribulus Terrestris", "Moringa Oleifera Extract", "Ginseng", "Zinc Gluconate", "Macca Root"],
    usageInstructions: "Take 1 capsule twice daily with a warm glass of water, preferably after meals.",
    benefits: [
      "Boosts daily physical and mental stamina",
      "Supports healthy testosterone levels",
      "Improves prostate health and urinary flow",
      "Combats occupational stress and chronic fatigue"
    ],
    warnings: [
      "Keep out of reach of children under 18 years.",
      "Consult a doctor if you have a known cardiac condition."
    ],
    rating: 4.8,
    reviewsCount: 42,
    isBestSeller: true,
    stock: 18,
    featuredBenefits: ["Hormonal Balance", "Maximum Stamina", "Stress Defense"],
    reviews: [
      {
        id: "rev-1-1",
        author: "Khamis Juma",
        rating: 5,
        date: "2026-06-15",
        comment: "Excellent product! I feel so energetic after long hours at my office in Posta.",
        verified: true
      },
      {
        id: "rev-1-2",
        author: "Emanuel Massawe",
        rating: 4,
        date: "2026-06-10",
        comment: "Very effective. Recommended by a specialist at Segerea clinic. Will purchase again.",
        verified: true
      }
    ]
  },
  {
    id: "prod-2",
    slug: "prostactive-care-gold",
    name: "PJ ProstActive Care Gold",
    category: "Men's Health",
    price: 65000,
    images: [
      CLINIC_MEDIA.prostate
    ],
    shortBenefits: "Targeted prostate protection and urinary control.",
    description: "Prepared specifically for men over 40 to support healthy prostate size and steady urinary flow. Combines standardized Saw Palmetto berry with cold-pressed Tanzanian pumpkin seed extract.",
    ingredients: ["Saw Palmetto Extract", "Pumpkin Seed Extract", "Pygeum Africanum", "Lycopene", "Selenium"],
    usageInstructions: "Take 2 capsules daily in the evening with food.",
    benefits: [
      "Reduces nocturnal bathroom trips",
      "Supports healthy, full bladder emptying",
      "Delivers powerful cellular antioxidants to prostate tissues"
    ],
    warnings: [
      "Only for adult males.",
      "Do not exceed the recommended daily dose."
    ],
    rating: 4.9,
    reviewsCount: 29,
    isBestSeller: true,
    stock: 4,
    featuredBenefits: ["Bladder Comfort", "Premium Antioxidants", "Saw Palmetto Powered"],
    reviews: [
      {
        id: "rev-2-1",
        author: "Mzee Ibrahim",
        rating: 5,
        date: "2026-06-12",
        comment: "Nimeona mabadiliko makubwa sana! Silii tena usiku mara kwa mara. Asanteni PJHerbal.",
        verified: true
      }
    ]
  },
  {
    id: "prod-3",
    slug: "green-tea-slim-burn",
    name: "PJ Green Tea Slim Burn",
    category: "Weight Management",
    price: 35000,
    originalPrice: 42000,
    images: [
      CLINIC_MEDIA.greenTea
    ],
    shortBenefits: "Accelerates fat metabolism and detoxification.",
    description: "A potent fat-burning supplement utilizing highly concentrated green tea catechins (EGCG) combined with African ginger to promote thermal activity, reduce stubborn belly fat, and supply healthy energy.",
    ingredients: ["Green Tea Extract (98% Polyphenols)", "L-Carnitine", "Ginger Root Powder", "Garcinia Cambogia", "Chromium"],
    usageInstructions: "Take 1 capsule 30 minutes before your morning exercise or breakfast.",
    benefits: [
      "Speeds up resting metabolic rate",
      "Aids in natural thermogenesis and fat breakdown",
      "Curbs appetite and sugar cravings effectively",
      "Detoxifies the digestive system"
    ],
    warnings: [
      "Contains natural caffeine. Avoid taking close to bedtime.",
      "Not recommended for pregnant or lactating mothers."
    ],
    rating: 4.6,
    reviewsCount: 56,
    isBestSeller: true,
    stock: 22,
    featuredBenefits: ["Fast Metabolism", "Appetite Control", "High Antioxidant"],
    reviews: [
      {
        id: "rev-3-1",
        author: "Amina Salum",
        rating: 5,
        date: "2026-06-25",
        comment: "This has really helped me control my sugar cravings. Lost 3kgs in 3 weeks with light exercise!",
        verified: true
      }
    ]
  },
  {
    id: "prod-4",
    slug: "moringa-power-boost",
    name: "PJ Pure Moringa Power Boost",
    category: "Energy & Immunity",
    price: 30000,
    images: [
      CLINIC_MEDIA.moringa
    ],
    shortBenefits: "Organic superfood containing 90+ essential nutrients.",
    description: "Harvested from organic farms in Morogoro, Tanzania, our Moringa capsules contain pure leaf powder packed with vitamins, iron, calcium, and essential amino acids to revitalize your entire body.",
    ingredients: ["100% Organic Moringa Oleifera Powder"],
    usageInstructions: "Take 2 capsules with breakfast every morning.",
    benefits: [
      "Combats nutritional deficiencies naturally",
      "Provides sustained non-jittery energy all day",
      "Strengthens the immune defense system against seasonal illnesses",
      "Promotes radiant, glowing skin and cellular regeneration"
    ],
    warnings: ["Store in a cool dry place away from direct sunlight."],
    rating: 4.9,
    reviewsCount: 78,
    isBestSeller: true,
    stock: 15,
    featuredBenefits: ["100% Tanzanian Organic", "Rich in Vitamins & Iron", "Natural Immunity"],
    reviews: [
      {
        id: "rev-4-1",
        author: "Neema Shayo",
        rating: 5,
        date: "2026-06-20",
        comment: "Moringa yetu ya kitanzania ni muujiza! Ngozi yangu inang'aa na sichoki kabisa mchana.",
        verified: true
      }
    ]
  },
  {
    id: "prod-5",
    slug: "fembalance-glow-max",
    name: "PJ FemBalance Glow Max",
    category: "Women's Wellness",
    price: 50000,
    originalPrice: 60000,
    images: [
      CLINIC_MEDIA.femBalance
    ],
    shortBenefits: "Supports hormonal balance, skin glow, and mood.",
    description: "A botanical blend prepared for women to help ease monthly cycle discomfort, support hormonal steadiness, and nourish skin naturally using Evening Primrose, Shatavari, and Dong Quai.",
    ingredients: ["Evening Primrose Oil Extract", "Dong Quai Root", "Shatavari Powder", "Folic Acid", "Vitamin E"],
    usageInstructions: "Take 1 capsule twice daily with meals.",
    benefits: [
      "Eases pre-menstrual symptoms and cramps",
      "Improves natural skin hydration and elasticity",
      "Balances moods and energy levels under stress"
    ],
    warnings: [
      "Do not use if pregnant without consult from a healthcare professional."
    ],
    rating: 4.7,
    reviewsCount: 31,
    isBestSeller: false,
    stock: 2,
    featuredBenefits: ["Cycle Regulation", "Skin Glow & Moisture", "Natural Mood Lift"],
    reviews: [
      {
        id: "rev-5-1",
        author: "Sophia Temu",
        rating: 5,
        date: "2026-06-28",
        comment: "Nimekuwa nikiitumia kwa miezi miwili sasa, maumivu ya tumbo wakati wa hedhi yamepungua kwa asilimia 90!",
        verified: true
      }
    ]
  },
  {
    id: "prod-6",
    slug: "neurofocus-extra",
    name: "PJ NeuroFocus Extra Strength",
    category: "Brain & Focus",
    price: 55000,
    images: [
      CLINIC_MEDIA.neuroFocus
    ],
    shortBenefits: "Sharpens mental focus, memory retention, and mental speed.",
    description: "PJ NeuroFocus combines traditional herbal extracts to help working adults, students, and older patients maintain clear concentration and steady recall through demanding days.",
    ingredients: ["Ginkgo Biloba Extract", "Bacopa Monnieri", "L-Theanine", "Phosphatidylserine", "Vitamin B12"],
    usageInstructions: "Take 1 capsule in the morning with a full glass of water. Perfect for work or study sessions.",
    benefits: [
      "Increases brain oxygenation and blood circulation",
      "Nourishes neurological networks for quick recall",
      "Reduces mental fatigue during extensive cognitive work"
    ],
    warnings: [
      "Do not take alongside blood-thinning medications without consulting a cardiologist."
    ],
    rating: 4.8,
    reviewsCount: 23,
    isBestSeller: false,
    stock: 11,
    featuredBenefits: ["Nootropic Infused", "Enhanced Study/Work Focus", "High Bioavailability"],
    reviews: [
      {
        id: "rev-6-1",
        author: "Baraka Mussa",
        rating: 5,
        date: "2026-06-22",
        comment: "Helpful during long accounting days. Keeps my focus steady without the crash I get from strong coffee.",
        verified: true
      }
    ]
  },
  {
    id: "prod-7",
    slug: "cleansedetox-colon-fit",
    name: "PJ CleanseDetox Colon Fit",
    category: "Detox & Digestion",
    price: 40000,
    images: [
      CLINIC_MEDIA.detox
    ],
    shortBenefits: "Gently purges toxins, relieves bloating, and eases digestion.",
    description: "A fast-acting, non-aggressive digestive detox formulation that sweeps the intestinal tract of sluggish waste material, bloating gases, and accumulated toxins. Revitalizes intestinal microflora and optimizes nutrient assimilation.",
    ingredients: ["Psyllium Husk", "Cascara Sagrada", "Aloe Vera Inner Leaf Extract", "Ginger Root", "Acidophilus Probiotic"],
    usageInstructions: "Take 2 capsules before bed with plenty of warm water. Always drink at least 8 glasses of water daily while using.",
    benefits: [
      "Eases occasional constipation and flattens bloating within 24-48 hours",
      "Restores robust colon transit and light physical feeling",
      "Encourages beneficial gut bacteria colonies"
    ],
    warnings: [
      "Do not use for more than 7 consecutive days without a rest period.",
      "Ensure rich fluid intake."
    ],
    rating: 4.7,
    reviewsCount: 68,
    isBestSeller: true,
    stock: 25,
    featuredBenefits: ["Bloat Relief", "Probiotic Infused", "Gentle Overnight Action"],
    reviews: [
      {
        id: "rev-7-1",
        author: "Lilian Aloyce",
        rating: 5,
        date: "2026-06-27",
        comment: "Inasafisha vizuri sana na bila kuumiza tumbo. Bloating yote imeisha kabisa. Napendekeza sana!",
        verified: true
      }
    ]
  },
  {
    id: "prod-8",
    slug: "ketoherbal-carb-blocker",
    name: "PJ KetoHerbal Carb Blocker",
    category: "Weight Management",
    price: 48000,
    images: [
      CLINIC_MEDIA.ketoCarb
    ],
    shortBenefits: "Supports carbohydrate control and balanced daily metabolism.",
    description: "Prepared to help moderate starch absorption alongside balanced low-sugar meals, supporting steadier afternoon energy and sensible weight goals.",
    ingredients: ["White Kidney Bean Extract", "Garcinia Fruit Extract", "Green Coffee Bean", "Chromium Picolinate"],
    usageInstructions: "Take 1 capsule 10 minutes prior to eating starch-rich meals.",
    benefits: [
      "Assists in keeping blood glucose in a stable zone",
      "Blocks up to 60% of dietary starch calorie conversions",
      "Reduces immediate post-meal energy slumps and drowsiness"
    ],
    warnings: [
      "Consult a doctor if you are managing a diabetic condition."
    ],
    rating: 4.5,
    reviewsCount: 19,
    isBestSeller: false,
    stock: 12,
    featuredBenefits: ["Carb Neutralization", "Sugar Stability", "Keto Diet Companion"],
    reviews: [
      {
        id: "rev-8-1",
        author: "Yohana Mlay",
        rating: 4,
        date: "2026-06-18",
        comment: "Great helper when having cheat days with Tanzanian Pilau. Helps me keep in shape.",
        verified: true
      }
    ]
  }
];

export const INITIAL_BLOGS: BlogArticle[] = [
  {
    id: "blog-1",
    slug: "moringa-miracle-tree-tanzania",
    title: "Moringa: The Miracle Superfood of Tanzania",
    summary: "Discover why Moringa harvested from the slopes of Morogoro is gaining massive worldwide popularity and how it boosts immunity.",
    content: `### Siri ya Lishe Bora: Moringa ya Kitanzania
Moringa Oleifera, inayofahamika zaidi kama "Mti wa Muujiza" au "Mlonge" nchini Tanzania, ni moja ya vyakula vyenye virutubisho vingi zaidi duniani. Katika kliniki yetu ya PJHerbal iliyopo Segerea, tumekuwa tukishauri wagonjwa kutumia Mlonge kwa miaka mingi kwa sababu zifuatazo:

#### 1. Virutubisho vya Kipekee
Moringa ina virutubisho vingi kuliko vyakula vya kawaida:
*   **Mara 7 zaidi ya Vitamin C** kuliko Machungwa.
*   **Mara 4 zaidi ya Calcium** kuliko Maziwa ya ng'ombe.
*   **Mara 3 zaidi ya Potassium** kuliko Ndizi.
*   **Mara 2 zaidi ya Protein** kuliko Maziwa ya Mgando.

#### 2. Kuongeza Kinga ya Mwili (Immunity Booster)
Katika kipindi hiki cha mabadiliko ya hali ya hewa Dar es Salaam, kuwa na kinga imara ni muhimu. Moringa ina antioxidants zenye nguvu ambazo zinasaidia kupambana na magonjwa ya maambukizi, uchovu na kusaidia seli za mwili kujirekebisha haraka.

#### Jinsi ya Kuitumia
Kwa ufanisi wa hali ya juu na usafi, PJHerbal tumetengeneza **PJ Pure Moringa Power Boost** katika mfumo wa kapsuli (capsules). Hii inakuepusha na ladha kali ya unga na inakupa kipimo sahihi cha kila siku bila kupoteza virutubisho.`,
    author: "Dr. Peter Juma (Segerea Clinic)",
    date: "2026-06-24",
    readTime: "4 min read",
    category: "Nutrition",
    image: CLINIC_MEDIA.moringa,
    tags: ["Moringa", "Immunity", "Local Herbs", "Tanzania"]
  },
  {
    id: "blog-2",
    slug: "natural-bloating-remedies-dar",
    title: "Natural Remedies for Bloating and Digestive Bloat",
    summary: "Are you suffering from constant stomach bloating? Read about natural ways to cleanse your colon and improve digestive health.",
    content: `### Epuka Maumivu na Kuvimbiwa kwa Tumbo (Bloating) Mara kwa Mara
Watu wengi katika miji mikubwa kama Dar es Salaam wanakabiliwa na matatizo ya mfumo wa chakula: gesi tumboni, tumbo kujaa, na kukosa choo vizuri. Hii inatokana na kubadilika kwa mitindo ya maisha, vyakula vya mafuta mengi (chips, kuku wa kisasa, nk), na unywaji mdogo wa maji.

#### Njia Tatu Rahisi za Kusafisha Tumbo Lako:

1.  **Kunywa Maji ya Uvuguvugu Asubuhi:** 
    Glasi mbili za maji ya uvuguvugu asubuhi kabla ya kula chochote zinasaidia kuamsha mfumo wa mmeng'enyo na kulainisha mabaki ya chakula kwenye utumbo.
    
2.  **Tumia Vyakula vyenye Fibres na Probiotics:**
    Psyllium Husk na Tangawizi (Ginger) ni rafiki mkubwa wa utumbo. Zinasafisha utumbo kwa upole bila kuondoa bakteria wazuri wa tumboni.

3.  **Kufanya Colon Detoxification ya Uhakika:**
    Ikiwa matatizo yamekuwa ya muda mrefu, kusafisha mfumo wako wa chakula ni hatua ya kwanza kabisa ya matibabu. Ndio maana tulitengeneza **PJ CleanseDetox Colon Fit** ambayo inasaidia kupunguza bloating ndani ya masaa 24-48 tu.

#### Ushauri wa Kitaalamu
Unapofanya detoxification, epuka kula vyakula vizito vyenye gluten nyingi. Ruhusu tumbo lako kupumzika ili upate matokeo mazuri.`,
    author: "Dr. Peter Juma (Segerea Clinic)",
    date: "2026-06-18",
    readTime: "5 min read",
    category: "Detox",
    image: CLINIC_MEDIA.detox,
    tags: ["Detox", "Bloating", "Digestive Health", "Segerea Clinic"]
  },
  {
    id: "blog-3",
    slug: "male-vitality-supplements-after-40",
    title: "Maintaining Male Vitality and Prostate Health After 40",
    summary: "Essential guidelines for adult men on protecting prostate cells, preventing urinary issues, and staying active.",
    content: `### Afya ya Prostate na Nguvu za Kiume Baada ya Miaka 40
Ni ukweli wa kibiolojia kuwa kadiri mwanaume anavyoumba umri, homoni za kiume (Testosterone) huanza kupungua kwa asilimia 1 hadi 2 kila mwaka kuanzia miaka 30. Pia, tezi dume (prostate) huanza kukua kiasili, jambo linaloweza kuleta athari kwenye mfumo wa mkojo na nguvu za kiume.

#### Dalili za Mapema za Changamoto za Tezi Dume (Prostate):
*   Kuamka mara kwa mara usiku kwenda kukojoa.
*   Mkojo kukatika-katika au kutoka kwa kasi ndogo.
*   Kuhisi kibofu hakijaisha mkojo hata baada ya kumaliza.
*   Kukosa nguvu za kutosha za kiume na uchovu usioisha.

#### Nini cha Kufanya Kujilinda:
1.  **Vyakula vyenye Lycopene:** Nyanya zilizoiva zikipikwa hutoa kiasi kikubwa cha Lycopene, kirutubisho kikuu kinacholinda afya ya seli za tezi dume.
2.  **Mbegu za Maboga (Pumpkin Seeds):** Zina madini mengi ya Zinc na fitosteroli ambazo zinasaidia kuzuia tezi dume kukua isivyo kawaida.
3.  **Matumizi ya Virutubisho Maalum:** Saw Palmetto imethibitishwa kisayansi kupunguza athari za homoni ya DHT ambayo inasababisha tezi dume kukua. Bidhaa kama **PJ ProstActive Care Gold** yetu hutoa virutubisho vyote hivi kwa pamoja kwa usalama wa hali ya juu.

Wanaume wengi huwa na hofu kuongelea matatizo haya. Lakini katika kliniki yetu ya PJHerbal Segerea, tunatoa ushauri wa faragha na huduma bora za kurejesha afya yako kwa siri na heshima kubwa.`,
    author: "Dr. Peter Juma (Segerea Clinic)",
    date: "2026-06-12",
    readTime: "6 min read",
    category: "Men's Health",
    image: CLINIC_MEDIA.prostate,
    tags: ["Mens Health", "Prostate", "Testosterone", "Saw Palmetto"]
  }
];

export const INITIAL_CAMPAIGNS: PromoCampaign[] = [
  {
    id: "camp-1",
    code: "PJHERBAL10",
    discountPercentage: 10,
    description: "10% Off on all premium supplements",
    active: true,
    expiryDate: "2026-12-31"
  },
  {
    id: "camp-2",
    code: "WELCOME5000",
    discountPercentage: 15,
    description: "Welcome Discount - 15% Off your first purchase",
    active: true,
    expiryDate: "2026-12-31"
  },
  {
    id: "camp-3",
    code: "SEGEREAFREE",
    discountPercentage: 5,
    description: "Segerea Local Special: 5% Off and prioritize shipping",
    active: true,
    expiryDate: "2026-09-30"
  }
];

export const TANZANIA_REGIONS = [
  {
    name: "Dar es Salaam",
    districts: ["Ilala (includes Segerea)", "Kinondoni", "Temeke", "Ubungo", "Kigamboni"],
    baseShipping: 3000
  },
  {
    name: "Arusha",
    districts: ["Arusha Mjini", "Arumeru", "Karatu", "Longido", "Monduli", "Ngorongoro"],
    baseShipping: 8000
  },
  {
    name: "Mwanza",
    districts: ["Nyamagana", "Ilemela", "Sengerema", "Misungwi", "Magu", "Kwimba", "Ukerewe"],
    baseShipping: 9000
  },
  {
    name: "Dodoma",
    districts: ["Dodoma Mjini", "Bahi", "Chamwino", "Kondoa", "Mpwapwa", "Kongwa", "Chemba"],
    baseShipping: 7000
  },
  {
    name: "Morogoro",
    districts: ["Morogoro Mjini", "Kilosa", "Kilombero", "Ulanga", "Mvomero", "Gairo"],
    baseShipping: 6000
  },
  {
    name: "Pwani",
    districts: ["Kibaha", "Bagamoyo", "Kisarawe", "Mkuranga", "Rufiji", "Mafia", "Chalinze"],
    baseShipping: 5000
  },
  {
    name: "Geita",
    districts: ["Geita Mjini", "Chato", "Bukombe", "Mbogwe", "Nyang'hwale"],
    baseShipping: 9000
  },
  {
    name: "Iringa",
    districts: ["Iringa Mjini", "Kilolo", "Mufindi", "Iringa Vijijini"],
    baseShipping: 8000
  },
  {
    name: "Kagera",
    districts: ["Bukoba Mjini", "Misenyi", "Karagwe", "Kyerwa", "Biharamulo", "Ngara", "Muleba"],
    baseShipping: 10000
  },
  {
    name: "Katavi",
    districts: ["Mpanda Mjini", "Mlele", "Mpanda Vijijini"],
    baseShipping: 9500
  },
  {
    name: "Kigoma",
    districts: ["Kigoma Mjini", "Kasulu Mjini", "Kibondo", "Kakonko", "Uvinza", "Buhigwe"],
    baseShipping: 10000
  },
  {
    name: "Kilimanjaro",
    districts: ["Moshi Mjini", "Hai", "Siha", "Rombo", "Mwanga", "Same", "Moshi Vijijini"],
    baseShipping: 7500
  },
  {
    name: "Lindi",
    districts: ["Lindi Mjini", "Kilwa", "Ruangwa", "Nachingwea", "Liwale"],
    baseShipping: 7500
  },
  {
    name: "Manyara",
    districts: ["Babati Mjini", "Mbulu", "Hanang", "Kiteto", "Simanjiro"],
    baseShipping: 8500
  },
  {
    name: "Mara",
    districts: ["Musoma Mjini", "Tarime", "Rorya", "Serengeti", "Bunda", "Butiama"],
    baseShipping: 9500
  },
  {
    name: "Mbeya",
    districts: ["Mbeya Mjini", "Chunya", "Mbarali", "Kyela", "Rungwe"],
    baseShipping: 8500
  },
  {
    name: "Mtwara",
    districts: ["Mtwara Mjini", "Masasi", "Newala", "Nanyumbu", "Tandahimba"],
    baseShipping: 8000
  },
  {
    name: "Njombe",
    districts: ["Njombe Mjini", "Ludewa", "Makete", "Wanging'ombe"],
    baseShipping: 8500
  },
  {
    name: "Rukwa",
    districts: ["Sumbawanga Mjini", "Kalambo", "Nkasi"],
    baseShipping: 9500
  },
  {
    name: "Ruvuma",
    districts: ["Songea Mjini", "Mbinga", "Namtumbo", "Tunduru", "Nyasa"],
    baseShipping: 9000
  },
  {
    name: "Shinyanga",
    districts: ["Shinyanga Mjini", "Kahama Mjini", "Kishapu", "Msalala"],
    baseShipping: 8500
  },
  {
    name: "Simiyu",
    districts: ["Bariadi Mjini", "Maswa", "Itilima", "Meatu", "Busega"],
    baseShipping: 9000
  },
  {
    name: "Singida",
    districts: ["Singida Mjini", "Iramba", "Manyoni", "Ikungi", "Mkalama"],
    baseShipping: 8000
  },
  {
    name: "Songwe",
    districts: ["Mbozi", "Momba", "Ileje", "Tunduma Mjini"],
    baseShipping: 9000
  },
  {
    name: "Tabora",
    districts: ["Tabora Mjini", "Nzega", "Igunga", "Sikonge", "Urambo", "Uyui"],
    baseShipping: 8500
  },
  {
    name: "Tanga",
    districts: ["Tanga Mjini", "Muheza", "Korogwe", "Lushoto", "Pangani", "Mkinga", "Handeni"],
    baseShipping: 7000
  },
  {
    name: "Zanzibar North (Kaskazini Unguja)",
    districts: ["Kaskazini A", "Kaskazini B"],
    baseShipping: 10000
  },
  {
    name: "Zanzibar South (Kusini Unguja)",
    districts: ["Kati", "Kusini"],
    baseShipping: 10000
  },
  {
    name: "Zanzibar West (Mjini Magharibi)",
    districts: ["Mjini", "Magharibi A", "Magharibi B"],
    baseShipping: 10000
  },
  {
    name: "Pemba North (Kaskazini Pemba)",
    districts: ["Wete", "Micheweni"],
    baseShipping: 11000
  },
  {
    name: "Pemba South (Kusini Pemba)",
    districts: ["Chake Chake", "Mkoani"],
    baseShipping: 11000
  }
];
