import { categoryName, formatNumber, formatPrice, subcategoryName } from "./format";

export type SearchFilters = {
  q?: string;
  category?: string;
  subcategory?: string;
  county?: string;
  condition?: "new" | "used";
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  fuel?: string;
  gearbox?: string;
  minRooms?: number;
  minArea?: number;
  maxArea?: number;
};

/** Short labels for each active filter, in reading order. */
export function filterLabels(p: SearchFilters) {
  const out: { key: keyof SearchFilters; label: string }[] = [];
  if (p.q) out.push({ key: "q", label: `„${p.q}”` });
  if (p.category) out.push({ key: "category", label: categoryName(p.category) });
  if (p.category && p.subcategory) out.push({ key: "subcategory", label: subcategoryName(p.category, p.subcategory) });
  if (p.county) out.push({ key: "county", label: p.county });
  if (p.maxPrice === 0) out.push({ key: "maxPrice", label: "Gratuite" });
  else {
    if (p.minPrice !== undefined) out.push({ key: "minPrice", label: `de la ${formatPrice(p.minPrice)}` });
    if (p.maxPrice !== undefined) out.push({ key: "maxPrice", label: `până la ${formatPrice(p.maxPrice)}` });
  }
  if (p.condition) out.push({ key: "condition", label: p.condition === "new" ? "Nou" : "Folosit" });
  if (p.minYear !== undefined) out.push({ key: "minYear", label: `din ${p.minYear}` });
  if (p.maxYear !== undefined) out.push({ key: "maxYear", label: `până în ${p.maxYear}` });
  if (p.maxMileage !== undefined) out.push({ key: "maxMileage", label: `max. ${formatNumber(p.maxMileage)} km` });
  if (p.fuel) out.push({ key: "fuel", label: p.fuel });
  if (p.gearbox) out.push({ key: "gearbox", label: `Cutie ${p.gearbox.toLowerCase()}` });
  if (p.minRooms) out.push({ key: "minRooms", label: `${p.minRooms}+ camere` });
  if (p.minArea !== undefined) out.push({ key: "minArea", label: `de la ${p.minArea} m²` });
  if (p.maxArea !== undefined) out.push({ key: "maxArea", label: `până la ${p.maxArea} m²` });
  return out;
}

/** A name for a saved search: the query, else the most specific category. */
export function searchTitle(p: SearchFilters) {
  if (p.q) return p.q;
  if (p.category && p.subcategory) return subcategoryName(p.category, p.subcategory);
  if (p.category) return categoryName(p.category);
  if (p.maxPrice === 0) return "Lucruri gratuite";
  return "Toate anunțurile";
}

/** Same comparison key as the backend uses, so the UI knows a search is already saved. */
export function filterKey(s: SearchFilters) {
  return JSON.stringify([
    s.q?.trim().toLowerCase() || null,
    ...[s.category, s.subcategory, s.county, s.condition, s.minPrice, s.maxPrice, s.minYear, s.maxYear, s.maxMileage, s.fuel, s.gearbox, s.minRooms, s.minArea, s.maxArea].map((x) => x ?? null),
  ]);
}

export function pickFilters(s: SearchFilters): SearchFilters {
  const { q, category, subcategory, county, condition, minPrice, maxPrice, minYear, maxYear, maxMileage, fuel, gearbox, minRooms, minArea, maxArea } = s;
  return { q, category, subcategory, county, condition, minPrice, maxPrice, minYear, maxYear, maxMileage, fuel, gearbox, minRooms, minArea, maxArea };
}
