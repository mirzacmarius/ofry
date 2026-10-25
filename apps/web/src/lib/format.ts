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
