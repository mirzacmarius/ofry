// Shared between the Convex backend and the web app.

export type Subcategory = { slug: string; name: string };
export type Category = {
  slug: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
  /** Extra fields shown on the listing form for this category. */
  attributes?: ("year" | "mileage" | "fuel" | "gearbox" | "rooms" | "area")[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "imobiliare",
    name: "Imobiliare",
    icon: "home",
    attributes: ["rooms", "area"],
    subcategories: [
      { slug: "apartamente-vanzare", name: "Apartamente de vânzare" },
      { slug: "apartamente-inchiriere", name: "Apartamente de închiriat" },
      { slug: "case", name: "Case și vile" },
      { slug: "terenuri", name: "Terenuri" },
      { slug: "spatii-comerciale", name: "Spații comerciale" },
    ],
  },
  {
    slug: "auto",
    name: "Auto, moto și ambarcațiuni",
    icon: "car",
    attributes: ["year", "mileage", "fuel", "gearbox"],
    subcategories: [
      { slug: "autoturisme", name: "Autoturisme" },
      { slug: "motociclete", name: "Motociclete și scutere" },
      { slug: "piese-auto", name: "Piese auto" },
      { slug: "rulote", name: "Rulote și autorulote" },
      { slug: "ambarcatiuni", name: "Ambarcațiuni" },
    ],
  },
  {
    slug: "electronice",
    name: "Electronice și electrocasnice",
    icon: "smartphone",
    subcategories: [
      { slug: "telefoane", name: "Telefoane" },
      { slug: "laptopuri", name: "Laptopuri și calculatoare" },
      { slug: "tv-audio", name: "TV și audio" },
      { slug: "foto", name: "Foto și video" },
      { slug: "console", name: "Console și jocuri" },
      { slug: "electrocasnice", name: "Electrocasnice" },
    ],
  },
  {
    slug: "casa-gradina",
    name: "Casă și grădină",
    icon: "sofa",
    subcategories: [
      { slug: "mobila", name: "Mobilă" },
      { slug: "decoratiuni", name: "Decorațiuni" },
      { slug: "gradina", name: "Grădină" },
      { slug: "bricolaj", name: "Unelte și bricolaj" },
    ],
  },
  {
    slug: "moda",
    name: "Modă și frumusețe",
    icon: "shirt",
    subcategories: [
      { slug: "haine-dama", name: "Haine damă" },
      { slug: "haine-barbati", name: "Haine bărbați" },
      { slug: "incaltaminte", name: "Încălțăminte" },
      { slug: "accesorii", name: "Accesorii și bijuterii" },
    ],
  },
  {
    slug: "copii",
    name: "Mama și copilul",
    icon: "baby",
    subcategories: [
      { slug: "haine-copii", name: "Haine copii" },
      { slug: "jucarii", name: "Jucării" },
      { slug: "carucioare", name: "Cărucioare și scaune auto" },
    ],
  },
  {
    slug: "sport-hobby",
    name: "Sport, timp liber și hobby",
    icon: "bike",
    subcategories: [
      { slug: "biciclete", name: "Biciclete" },
      { slug: "fitness", name: "Fitness și sport" },
      { slug: "carti", name: "Cărți" },
      { slug: "instrumente", name: "Instrumente muzicale" },
      { slug: "colectii", name: "Colecții" },
    ],
  },
  {
    slug: "animale",
    name: "Animale de companie",
    icon: "paw",
    subcategories: [
      { slug: "caini", name: "Câini" },
      { slug: "pisici", name: "Pisici" },
      { slug: "accesorii-animale", name: "Accesorii" },
    ],
  },
  {
    slug: "locuri-de-munca",
    name: "Locuri de muncă",
    icon: "briefcase",
    subcategories: [
      { slug: "full-time", name: "Normă întreagă" },
      { slug: "part-time", name: "Part-time" },
      { slug: "freelance", name: "Freelance" },
    ],
  },
  {
    slug: "servicii",
    name: "Servicii",
    icon: "wrench",
    subcategories: [
      { slug: "constructii", name: "Construcții și renovări" },
      { slug: "transport", name: "Transport și mutări" },
      { slug: "reparatii", name: "Reparații" },
      { slug: "meditatii", name: "Meditații și cursuri" },
      { slug: "alte-servicii", name: "Alte servicii" },
    ],
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function getCategory(slug: string | undefined) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getSubcategory(category: string | undefined, sub: string | undefined) {
  return getCategory(category)?.subcategories.find((s) => s.slug === sub);
}

export const COUNTIES = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brăila",
  "Brașov", "București", "Buzău", "Călărași", "Caraș-Severin", "Cluj", "Constanța",
  "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara",
  "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt",
  "Prahova", "Sălaj", "Satu Mare", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea",
  "Vâlcea", "Vaslui", "Vrancea",
];

export const FUELS = ["Benzină", "Motorină", "GPL", "Hibrid", "Electric"];
export const GEARBOXES = ["Manuală", "Automată"];

export const MAX_IMAGES = 10;
