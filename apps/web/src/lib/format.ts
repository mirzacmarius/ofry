import { getCategory, getSubcategory } from "@ofry/backend/convex/lib/constants";
import { ConvexError } from "convex/values";

const priceFormat = new Intl.NumberFormat("ro-RO");

export function formatPrice(price: number) {
  return price === 0 ? "Gratuit" : `${priceFormat.format(price)} lei`;
}

export function formatNumber(n: number) {
  return priceFormat.format(n);
}

export function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "acum câteva secunde";
  const m = Math.floor(s / 60);
  if (m < 60) return m === 1 ? "acum un minut" : `acum ${m} minute`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? "acum o oră" : `acum ${h} ore`;
  const d = Math.floor(h / 24);
  if (d < 30) return d === 1 ? "ieri" : `acum ${d} zile`;
  return new Date(ts).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}

export function categoryName(slug: string) {
  return getCategory(slug)?.name ?? slug;
}

export function subcategoryName(category: string, sub: string) {
  return getSubcategory(category, sub)?.name ?? sub;
}

export function errorMessage(error: unknown) {
  if (error instanceof ConvexError) return String(error.data);
  return "A apărut o eroare. Încearcă din nou.";
}

const DAY = 86_400_000;

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Compact time for lists: 14:32 today, "ieri", weekday this week, "12 oct." before. */
export function shortTime(ts: number) {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / DAY);
  const d = new Date(ts);
  if (days <= 0) return d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "ieri";
  if (days < 7) return d.toLocaleDateString("ro-RO", { weekday: "short" });
  return d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

/** Clock time only, for chat bubbles. */
export function clockTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

/** Label for a chat date divider: Azi, Ieri or "12 octombrie". */
export function dayLabel(ts: number) {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / DAY);
  if (days <= 0) return "Azi";
  if (days === 1) return "Ieri";
  const d = new Date(ts);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("ro-RO", { day: "numeric", month: "long", ...(sameYear ? {} : { year: "numeric" }) });
}

/** "martie 2025" style, for "Pe Ofry din …". */
export function monthYear(ts: number) {
  return new Date(ts).toLocaleDateString("ro-RO", { month: "long", year: "numeric" });
}
