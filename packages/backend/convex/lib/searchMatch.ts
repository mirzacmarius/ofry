import type { Doc } from "../_generated/dataModel";

export type SearchFilters = Pick<
  Doc<"savedSearches">,
  "q" | "category" | "subcategory" | "county" | "condition" | "minPrice" | "maxPrice" | "minYear" | "maxYear" | "maxMileage" | "fuel" | "gearbox" | "minRooms" | "minArea" | "maxArea"
>;

const within = (value: number | undefined, min: number | undefined, max: number | undefined) =>
  (min === undefined && max === undefined) || (value !== undefined && (min === undefined || value >= min) && (max === undefined || value <= max));

/** Lowercase without diacritics, so "bicicleta" finds "bicicletă". */
export function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/**
 * Whether a listing matches a saved search. Close to what the search index
 * does: every word of the query must start a word of the listing text.
 */
export function matchesSearch(l: Doc<"listings">, s: SearchFilters) {
  if (l.status !== "active") return false;
  if (s.category && l.category !== s.category) return false;
  if (s.subcategory && l.subcategory !== s.subcategory) return false;
  if (s.county && l.county !== s.county) return false;
  if (s.condition && l.condition !== s.condition) return false;
  if (s.minPrice !== undefined && l.price < s.minPrice) return false;
  if (s.maxPrice !== undefined && l.price > s.maxPrice) return false;
  if (!within(l.year, s.minYear, s.maxYear)) return false;
  if (!within(l.mileage, undefined, s.maxMileage)) return false;
  if (!within(l.rooms, s.minRooms, undefined)) return false;
  if (!within(l.area, s.minArea, s.maxArea)) return false;
  if (s.fuel && l.fuel !== s.fuel) return false;
  if (s.gearbox && l.gearbox !== s.gearbox) return false;
  const q = s.q?.trim();
  if (q) {
    const words = new Set(normalize(l.searchText).split(/[^\p{L}\p{N}]+/u));
    const terms = normalize(q).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    if (!terms.every((t) => [...words].some((w) => w.startsWith(t)))) return false;
  }
  return true;
}

/** Same filters, ignoring empty values, for comparing two searches. */
export function filterKey(s: SearchFilters) {
  return JSON.stringify([
    s.q?.trim().toLowerCase() || null,
    ...[s.category, s.subcategory, s.county, s.condition, s.minPrice, s.maxPrice, s.minYear, s.maxYear, s.maxMileage, s.fuel, s.gearbox, s.minRooms, s.minArea, s.maxArea].map((x) => x ?? null),
  ]);
}
