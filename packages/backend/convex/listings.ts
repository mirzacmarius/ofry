import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { toCard } from "./lib/cards";
import { getCategory, getSubcategory, MAX_IMAGES } from "./lib/constants";
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
    const sellerListingCount = (
      await ctx.db
        .query("listings")
        .withIndex("by_seller", (i) => i.eq("sellerId", listing.sellerId))
        .collect()
    ).filter((l) => l.status === "active").length;

    const { searchText: _searchText, ...rest } = listing;
    return {
      ...rest,
      // Only show the phone number to signed in users to reduce scraping.
      phone: user ? listing.phone : listing.phone ? "hidden" : undefined,
      images,
      isOwner,
      isFavorite: !!favorite,
      sellerListingCount,
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
    return await Promise.all(listings.map((l) => toCard(ctx, l)));
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
      sellerName: listings[0]?.sellerName ?? null,
      listings: await Promise.all(active.map((l) => toCard(ctx, l))),
    };
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
    return await ctx.db.insert("listings", {
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
    });
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
    // Delete images that were removed from the listing.
    for (const old of listing.images) {
      if (!fields.images.includes(old)) await ctx.storage.delete(old);
    }
    await ctx.db.patch(id, {
      ...fields,
      title: fields.title.trim(),
      description: fields.description.trim(),
      city: fields.city.trim(),
      price: Math.round(fields.price),
      searchText: buildSearchText(fields),
    });
  },
});

export const setStatus = mutation({
  args: { id: v.id("listings"), status: listingStatus },
  handler: async (ctx, args) => {
    await getOwned(ctx, args.id);
    await ctx.db.patch(args.id, { status: args.status });
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
  },
});
