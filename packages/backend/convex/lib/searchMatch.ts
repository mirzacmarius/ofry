import type { Doc } from "../_generated/dataModel";

export type SearchFilters = Pick<Doc<"savedSearches">, "q" | "category" | "subcategory" | "county" | "condition" | "minPrice" | "maxPrice">;

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
  return JSON.stringify([s.q?.trim().toLowerCase() || null, s.category ?? null, s.subcategory ?? null, s.county ?? null, s.condition ?? null, s.minPrice ?? null, s.maxPrice ?? null]);
}
