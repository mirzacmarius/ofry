import { categoryName, formatPrice, subcategoryName } from "./format";

export type SearchFilters = {
  q?: string;
  category?: string;
  subcategory?: string;
  county?: string;
  condition?: "new" | "used";
  minPrice?: number;
  maxPrice?: number;
};

/** Short labels for each active filter, in reading order. */
export function filterLabels(p: SearchFilters) {
  const out: { key: keyof SearchFilters | "price"; label: string }[] = [];
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
  return JSON.stringify([s.q?.trim().toLowerCase() || null, s.category ?? null, s.subcategory ?? null, s.county ?? null, s.condition ?? null, s.minPrice ?? null, s.maxPrice ?? null]);
}

export function pickFilters(s: SearchFilters): SearchFilters {
  return { q: s.q, category: s.category, subcategory: s.subcategory, county: s.county, condition: s.condition, minPrice: s.minPrice, maxPrice: s.maxPrice };
}
