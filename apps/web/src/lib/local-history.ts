import type { ListingCard } from "@ofry/backend/convex/lib/cards";

// Per-browser conveniences only; every access is guarded because storage can be blocked.

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Ignore: private mode or storage full.
  }
}

const SEARCHES = "ofry-recent-searches";
const LISTINGS = "ofry-recent-listings";

export const recentSearches = () => read<string>(SEARCHES);

export function rememberSearch(q: string | undefined) {
  const text = q?.trim();
  if (!text) return;
  write(SEARCHES, [text, ...recentSearches().filter((s) => s.toLowerCase() !== text.toLowerCase())].slice(0, 6));
}

export const recentListings = () => read<ListingCard>(LISTINGS);

export function rememberListing(card: ListingCard) {
  write(LISTINGS, [card, ...recentListings().filter((c) => c._id !== card._id)].slice(0, 12));
}
