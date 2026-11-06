import type * as React from "react";
import {
  Baby,
  Bike,
  Briefcase,
  Car,
  Home,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Tag,
  Wrench,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  home: Home,
  car: Car,
  smartphone: Smartphone,
  sofa: Sofa,
  shirt: Shirt,
  baby: Baby,
  bike: Bike,
  paw: PawPrint,
  briefcase: Briefcase,
  wrench: Wrench,
} as const;

export function CategoryIcon({ icon, ...props }: { icon: string } & LucideProps) {
  const Icon = ICONS[icon as keyof typeof ICONS] ?? Tag;
  return <Icon {...props} />;
}

/** Short labels for tight spots (category rail, bottom sheets). */
const SHORT_NAMES: Record<string, string> = {
  imobiliare: "Imobiliare",
  auto: "Auto",
  electronice: "Electronice",
  "casa-gradina": "Casă",
  moda: "Modă",
  copii: "Copii",
  "sport-hobby": "Sport",
  animale: "Animale",
  "locuri-de-munca": "Joburi",
  servicii: "Servicii",
};

export function categoryShortName(slug: string, fallback: string) {
  return SHORT_NAMES[slug] ?? fallback;
}

/** Pastel tint per category, from the --ofry-tint-* tokens. */
const TINTS: Record<string, string> = {
  imobiliare: "lavender",
  auto: "slate",
  electronice: "periwinkle",
  "casa-gradina": "butter",
  moda: "pink",
  copii: "peach",
  "sport-hobby": "mint",
  animale: "butter",
  "locuri-de-munca": "sky",
  servicii: "peach",
};

/** Inline style that tints a `.tile-tinted` element for this category. */
export function categoryTint(slug: string) {
  return { "--tile-tint": `var(--ofry-tint-${TINTS[slug] ?? "slate"})` } as React.CSSProperties;
}
