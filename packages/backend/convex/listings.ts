import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, type QueryCtx } from "./_generated/server";
import { toCard } from "./lib/cards";
import { DAY_MS, formatLei, getCategory, getSubcategory, LISTING_DAYS, MAX_IMAGES, RENEW_WINDOW_DAYS } from "./lib/constants";
import { notify } from "./lib/notify";
import { publicProfile } from "./lib/profile";
import { getUser, requireUser } from "./lib/session";
import { listingFields, listingStatus } from "./schema";

const sortValidator = v.union(v.literal("newest"), v.literal("price_asc"), v.literal("price_desc"));


function buildSearchText(l: { title: string; description: string; city: string }) {
  return `${l.title} ${l.description} ${l.city}`;
}

function validate(input: {
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  city: string;
  images: Id<"_storage">[];
}) {
  const title = input.title.trim();
  if (title.length < 3 || title.length > 100) {
    throw new ConvexError("Titlul trebuie să aibă între 3 și 100 de caractere.");
  }
  if (input.description.trim().length > 5000) {
    throw new ConvexError("Descrierea poate avea cel mult 5000 de caractere.");
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new ConvexError("Prețul nu este valid.");
  }
  if (!getCategory(input.category) || !getSubcategory(input.category, input.subcategory)) {
    throw new ConvexError("Categoria nu este validă.");
  }
  if (!input.city.trim()) {
    throw new ConvexError("Localitatea este obligatorie.");
  }
  if (input.images.length > MAX_IMAGES) {
    throw new ConvexError(`Poți adăuga cel mult ${MAX_IMAGES} imagini.`);
  }
}

/**
 * Typical price band (25th to 75th percentile) of other active listings in the
 * same subcategory, or null when there are too few to say anything useful.
 */
async function similarPriceRange(
  ctx: QueryCtx,
  listing: { _id: Id<"listings">; category: string; subcategory: string },
) {
  const similar = await ctx.db
    .query("listings")
    .withIndex("by_status_category", (i) => i.eq("status", "active").eq("category", listing.category))
    .order("desc")
    .take(400);
  const prices = similar
    .filter((l) => l.subcategory === listing.subcategory && l._id !== listing._id && l.price > 0)
    .map((l) => l.price)
    .sort((a, b) => a - b);
  if (prices.length < 5) return null;
  const at = (q: number) => prices[Math.min(prices.length - 1, Math.floor(q * (prices.length - 1)))]!;
  const low = at(0.25);
  const high = at(0.75);
  if (high <= low) return null;
  return { low, high, count: prices.length };
}

export const search = query({
  args: {
    q: v.optional(v.string()),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    county: v.optional(v.string()),
    condition: v.optional(v.union(v.literal("new"), v.literal("used"))),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    sort: v.optional(sortValidator),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const q = args.q?.trim();
    const sort = args.sort ?? "newest";
    const { category, county, minPrice, maxPrice } = args;

    let base;
    if (q) {
      // Full text search is ordered by relevance.
      base = ctx.db.query("listings").withSearchIndex("search_text", (s) => {
        let f = s.search("searchText", q).eq("status", "active");
        if (category) f = f.eq("category", category);
        if (county) f = f.eq("county", county);
        return f;
      });
    } else if (sort === "newest") {
      base = (
        category
          ? ctx.db
              .query("listings")
              .withIndex("by_status_category", (i) =>
                i.eq("status", "active").eq("category", category),
              )
          : ctx.db.query("listings").withIndex("by_status", (i) => i.eq("status", "active"))
      ).order("desc");
    } else {
      const order = sort === "price_asc" ? "asc" : "desc";
      base = (
        category
          ? ctx.db.query("listings").withIndex("by_status_category_price", (i) => {
              const b = i.eq("status", "active").eq("category", category);
              const lo = minPrice !== undefined ? b.gte("price", minPrice) : b;
              return maxPrice !== undefined ? lo.lte("price", maxPrice) : lo;
            })
          : ctx.db.query("listings").withIndex("by_status_price", (i) => {
              const b = i.eq("status", "active");
              const lo = minPrice !== undefined ? b.gte("price", minPrice) : b;
              return maxPrice !== undefined ? lo.lte("price", maxPrice) : lo;
            })
      ).order(order);
    }

    const filtered = base.filter((f) => {
      const conds = [];
      if (args.subcategory) conds.push(f.eq(f.field("subcategory"), args.subcategory));
      if (county && !q) conds.push(f.eq(f.field("county"), county));
      if (args.condition) conds.push(f.eq(f.field("condition"), args.condition));
      if (minPrice !== undefined) conds.push(f.gte(f.field("price"), minPrice));
      if (maxPrice !== undefined) conds.push(f.lte(f.field("price"), maxPrice));
      return conds.length ? f.and(...conds) : true;
    });

    const result = await filtered.paginate(args.paginationOpts);
    return { ...result, page: await Promise.all(result.page.map((l) => toCard(ctx, l))) };
  },
});

export const latest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_status", (i) => i.eq("status", "active"))
      .order("desc")
      .take(Math.min(args.limit ?? 12, 48));
    return await Promise.all(listings.map((l) => toCard(ctx, l)));
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("listings", args.id);
    if (!id) return null;
    const listing = await ctx.db.get(id);
    if (!listing) return null;
    const user = await getUser(ctx);
    const isOwner = user?.id === listing.sellerId;
    if (listing.status === "inactive" && !isOwner) return null;

    const images = await Promise.all(
      listing.images.map(async (storageId) => ({
        storageId,
        url: await ctx.storage.getUrl(storageId),
      })),
    );
    const favorite = user
      ? await ctx.db
          .query("favorites")
          .withIndex("by_user_listing", (i) => i.eq("userId", user.id).eq("listingId", id))
          .unique()
      : null;
    const sellerListings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (i) => i.eq("sellerId", listing.sellerId))
      .collect();
    const sellerListingCount = sellerListings.filter((l) => l.status === "active").length;
    const sellerSince = Math.min(...sellerListings.map((l) => l._creationTime));
    const priceStats = listing.price > 0 ? await similarPriceRange(ctx, listing) : null;
    const favoriteCount = isOwner
      ? (await ctx.db.query("favorites").withIndex("by_listing", (i) => i.eq("listingId", id)).collect()).length
      : undefined;
    const seller = await publicProfile(ctx, listing.sellerId);

    const { searchText: _searchText, ...rest } = listing;
    return {
      ...rest,
      // Only show the phone number to signed in users to reduce scraping.
      phone: user ? listing.phone : listing.phone ? "hidden" : undefined,
      images,
      isOwner,
      isFavorite: !!favorite,
      sellerListingCount,
      sellerSince,
      priceStats,
      favoriteCount,
      sellerAvatarUrl: seller.avatarUrl,
    };
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (i) => i.eq("sellerId", user.id))
      .order("desc")
      .collect();
    return await Promise.all(
      listings.map(async (l) => ({
        ...(await toCard(ctx, l)),
        expiresAt: l.expiresAt,
        expiredAt: l.expiredAt,
        favoriteCount: (await ctx.db.query("favorites").withIndex("by_listing", (i) => i.eq("listingId", l._id)).collect()).length,
      })),
    );
  },
});

export const bySeller = query({
  args: { sellerId: v.string() },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (i) => i.eq("sellerId", args.sellerId))
      .order("desc")
      .take(100);
    const active = listings.filter((l) => l.status === "active");
    return {
      ...(await publicProfile(ctx, args.sellerId)),
      sellerName: listings[0]?.sellerName ?? null,
      sellerSince: listings.length ? Math.min(...listings.map((l) => l._creationTime)) : null,
      soldCount: listings.filter((l) => l.status === "sold").length,
      listings: await Promise.all(active.map((l) => toCard(ctx, l))),
    };
  },
});

/** Other active listings from the same subcategory, then the same category. */
export const similar = query({
  args: { id: v.id("listings"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.id);
    if (!listing) return [];
    const limit = Math.min(args.limit ?? 8, 24);
    const candidates = await ctx.db
      .query("listings")
      .withIndex("by_status_category", (i) => i.eq("status", "active").eq("category", listing.category))
      .order("desc")
      .take(200);
    const others = candidates.filter((l) => l._id !== listing._id);
    const sameSub = others.filter((l) => l.subcategory === listing.subcategory);
    const rest = others.filter((l) => l.subcategory !== listing.subcategory);
    // Prefer similar prices inside the subcategory.
    sameSub.sort((a, b) => Math.abs(a.price - listing.price) - Math.abs(b.price - listing.price));
    const picked = [...sameSub, ...rest].slice(0, limit);
    return await Promise.all(picked.map((l) => toCard(ctx, l)));
  },
});

export const categoryCounts = query({
  args: {},
  handler: async (ctx) => {
    const counts: Record<string, number> = {};
    // Fine for an MVP; switch to an aggregate component once listings grow.
    const active = await ctx.db
      .query("listings")
      .withIndex("by_status", (i) => i.eq("status", "active"))
      .take(5000);
    for (const l of active) counts[l.category] = (counts[l.category] ?? 0) + 1;
    return counts;
  },
});

export const create = mutation({
  args: listingFields,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    validate(args);
    const id = await ctx.db.insert("listings", {
      ...args,
      title: args.title.trim(),
      description: args.description.trim(),
      city: args.city.trim(),
      price: Math.round(args.price),
      sellerId: user.id,
      sellerName: user.name,
      status: "active",
      views: 0,
      searchText: buildSearchText(args),
      expiresAt: Date.now() + LISTING_DAYS * DAY_MS,
    });
    await ctx.scheduler.runAfter(0, internal.savedSearches.onListingCreated, { listingId: id });
    return id;
  },
});

async function getOwned(ctx: QueryCtx, id: Id<"listings">) {
  const user = await requireUser(ctx);
  const listing = await ctx.db.get(id);
  if (!listing || listing.sellerId !== user.id) {
    throw new ConvexError("Anunțul nu a fost găsit.");
  }
  return listing;
}

export const update = mutation({
  args: { id: v.id("listings"), ...listingFields },
  handler: async (ctx, { id, ...fields }) => {
    const listing = await getOwned(ctx, id);
    validate(fields);
    const price = Math.round(fields.price);
    // Remember the old price when it goes down so buyers see the reduction.
    const reference = listing.previousPrice ?? listing.price;
    const priceChange =
      price < listing.price
        ? { previousPrice: Math.max(reference, listing.price), priceDroppedAt: Date.now() }
        : price >= reference
          ? { previousPrice: undefined, priceDroppedAt: undefined }
          : {};
    // Delete images that were removed from the listing.
    for (const old of listing.images) {
      if (!fields.images.includes(old)) await ctx.storage.delete(old);
    }
    await ctx.db.patch(id, {
      ...fields,
      title: fields.title.trim(),
      description: fields.description.trim(),
      city: fields.city.trim(),
      price,
      ...priceChange,
      searchText: buildSearchText(fields),
    });
    if (price < listing.price && listing.status === "active") {
      // Tell everyone who saved the listing.
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_listing", (i) => i.eq("listingId", id))
        .take(500);
      for (const f of favorites) {
        if (f.userId === listing.sellerId) continue;
        await notify(ctx, {
          userId: f.userId,
          kind: "price_drop",
          title: "Preț redus",
          body: `la un anunț salvat: ${fields.title.trim()}, acum ${formatLei(price)}`,
          listingId: id,
        });
      }
    }
  },
});

export const setStatus = mutation({
  args: { id: v.id("listings"), status: listingStatus },
  handler: async (ctx, args) => {
    const listing = await getOwned(ctx, args.id);
    const now = Date.now();
    // Turning an expired listing back on starts a new period.
    const restart = args.status === "active" && listing.expiresAt !== undefined && listing.expiresAt < now;
    await ctx.db.patch(args.id, {
      status: args.status,
      ...(restart ? { expiresAt: now + LISTING_DAYS * DAY_MS, expiryNotified: false } : {}),
      ...(args.status === "active" ? { expiredAt: undefined } : {}),
    });
  },
});

/** Free renew: another full period, offered close to expiry or after it. */
export const renew = mutation({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await getOwned(ctx, args.id);
    const now = Date.now();
    if (listing.status === "sold") throw new ConvexError("Anunțul este marcat ca vândut.");
    const expired = listing.expiredAt !== undefined;
    const closeToExpiry = listing.expiresAt !== undefined && listing.expiresAt - now <= RENEW_WINDOW_DAYS * DAY_MS;
    if (!expired && !closeToExpiry) {
      throw new ConvexError(`Poți reînnoi anunțul cu ${RENEW_WINDOW_DAYS} zile înainte să expire.`);
    }
    await ctx.db.patch(args.id, { status: "active", expiresAt: now + LISTING_DAYS * DAY_MS, expiryNotified: false, expiredAt: undefined });
  },
});

/** Hourly (crons.ts): warn sellers 3 days ahead, then switch off expired listings. */
export const expire = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const soon = await ctx.db
      .query("listings")
      .withIndex("by_status_expires", (i) => i.eq("status", "active").gte("expiresAt", now).lt("expiresAt", now + 3 * DAY_MS))
      .take(500);
    for (const l of soon) {
      if (l.expiryNotified) continue;
      await ctx.db.patch(l._id, { expiryNotified: true });
      const days = Math.max(1, Math.round((l.expiresAt! - now) / DAY_MS));
      await notify(ctx, {
        userId: l.sellerId,
        kind: "expiring",
        title: "Anunțul expiră",
        body: `${l.title} expiră ${days === 1 ? "mâine" : `în ${days} zile`}. Îl poți reînnoi gratuit.`,
        listingId: l._id,
      });
    }
    const expired = await ctx.db
      .query("listings")
      .withIndex("by_status_expires", (i) => i.eq("status", "active").gte("expiresAt", 0).lt("expiresAt", now))
      .take(500);
    for (const l of expired) await ctx.db.patch(l._id, { status: "inactive", expiredAt: now });
  },
});

export const remove = mutation({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await getOwned(ctx, args.id);
    for (const img of listing.images) await ctx.storage.delete(img);
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_listing", (i) => i.eq("listingId", args.id))
      .collect();
    for (const f of favorites) await ctx.db.delete(f._id);
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_listing", (i) => i.eq("listingId", args.id))
      .collect();
    for (const r of reports) await ctx.db.delete(r._id);
    const views = await ctx.db
      .query("dailyViews")
      .withIndex("by_listing_day", (i) => i.eq("listingId", args.id))
      .collect();
    for (const d of views) await ctx.db.delete(d._id);
    // Conversations are kept so both sides keep their message history.
    await ctx.db.delete(args.id);
  },
});

export const recordView = mutation({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.id);
    if (!listing) return;
    const user = await getUser(ctx);
    if (user?.id === listing.sellerId) return;
    await ctx.db.patch(args.id, { views: listing.views + 1 });
    const day = Math.floor(Date.now() / DAY_MS);
    const today = await ctx.db
      .query("dailyViews")
      .withIndex("by_listing_day", (i) => i.eq("listingId", args.id).eq("day", day))
      .unique();
    if (today) await ctx.db.patch(today._id, { views: today.views + 1 });
    else await ctx.db.insert("dailyViews", { listingId: args.id, sellerId: listing.sellerId, day, views: 1 });
  },
});
