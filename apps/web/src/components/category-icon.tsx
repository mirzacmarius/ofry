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
