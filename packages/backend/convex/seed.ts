// Demo data for testing. Load and reset it from packages/backend:
//
//   bunx convex run seed:run                          # wipe demo data, then insert it again
//   bunx convex run seed:run '{"photos":"picsum"}'    # same, with stock photos from picsum.photos
//   bunx convex run seed:run '{"photos":"none"}'      # no photos at all
//   bunx convex run seed:clear                        # remove all demo data
//
// Only listings whose sellerId starts with "seed:" (plus the old "demo" seller) are touched,
// together with their photos, favorites and conversations. Real users' data is left alone.

import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction, internalMutation, type ActionCtx } from "./_generated/server";
import { getSubcategory } from "./lib/constants";
import { placeholderSvg } from "./lib/placeholder";
import { priceInRon, SEED_LISTINGS, SEED_SELLERS, type SeedListing } from "./lib/seedData";
import { listingFields, listingStatus } from "./schema";

const SEED_PREFIX = "seed:";
/** Seller id used by the first version of this seed script. */
const LEGACY_SELLER = "demo";
const DEFAULT_PHOTOS = 3;
const INSERT_BATCH = 10;

const photosMode = v.union(v.literal("placeholder"), v.literal("picsum"), v.literal("none"));

/** Small deterministic PRNG, so every run produces the same data. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function storePhotos(
  ctx: ActionCtx,
  listing: SeedListing,
  listingIndex: number,
  mode: "placeholder" | "picsum" | "none",
) {
  if (mode === "none") return [];
  const total = listing.photos ?? DEFAULT_PHOTOS;
  const ids: Id<"_storage">[] = [];
  for (let i = 0; i < total; i++) {
    let blob: Blob | null = null;
    if (mode === "picsum") {
      try {
        const res = await fetch(`https://picsum.photos/seed/ofry-${listingIndex}-${i}/800/600`);
        if (res.ok) blob = await res.blob();
      } catch {
        // Fall back to a generated placeholder below.
      }
    }
    blob ??= new Blob(
      [placeholderSvg({
        title: listing.title,
        category: listing.category,
        subcategory: listing.subcategory,
        index: i,
        total,
        seed: listingIndex,
      })],
      { type: "image/svg+xml" },
    );
    ids.push(await ctx.storage.store(blob));
  }
  return ids;
}

async function clearAll(ctx: ActionCtx): Promise<number> {
  let removed = 0;
  for (;;) {
    const { deleted, done } = await ctx.runMutation(internal.seed.deleteBatch, {});
    removed += deleted;
    if (done) return removed;
  }
}

/** Removes existing demo data, then inserts every listing in lib/seedData.ts. */
export const run = internalAction({
  args: { photos: v.optional(photosMode) },
  handler: async (ctx, args): Promise<{ removed: number; inserted: number }> => {
    const removed = await clearAll(ctx);
    const rand = mulberry32(20261101);

    // Shuffle so "newest" mixes categories instead of listing them in file order.
    const order = SEED_LISTINGS.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }

    let inserted = 0;
    for (let start = 0; start < order.length; start += INSERT_BATCH) {
      const batch = [];
      for (const index of order.slice(start, start + INSERT_BATCH)) {
        const l = SEED_LISTINGS[index]!;
        if (!getSubcategory(l.category, l.subcategory)) {
          throw new Error(`Unknown category ${l.category}/${l.subcategory} in "${l.title}"`);
        }
        const seller = SEED_SELLERS[l.seller];
        const price = priceInRon(l);
        batch.push({
          title: l.title,
          description: l.description,
          price,
          negotiable: l.negotiable ?? price > 0,
          category: l.category,
          subcategory: l.subcategory,
          condition: l.condition,
          county: l.county,
          city: l.city,
          images: await storePhotos(ctx, l, index, args.photos ?? "placeholder"),
          phone: seller.phone,
          year: l.year,
          mileage: l.mileage,
          fuel: l.fuel,
          gearbox: l.gearbox,
          rooms: l.rooms,
          area: l.area,
          sellerId: `${SEED_PREFIX}${l.seller}`,
          sellerName: seller.name,
          status: l.status ?? "active",
          views: Math.floor(rand() * rand() * 1500) + 3,
          searchText: `${l.title} ${l.description} ${l.city}`,
        });
      }
      await ctx.runMutation(internal.seed.insertBatch, { listings: batch });
      inserted += batch.length;
    }
    return { removed, inserted };
  },
});

/** Removes all demo listings and everything attached to them. */
export const clear = internalAction({
  args: {},
  handler: async (ctx): Promise<{ removed: number }> => ({ removed: await clearAll(ctx) }),
});

export const insertBatch = internalMutation({
  args: {
    listings: v.array(
      v.object({
        ...listingFields,
        sellerId: v.string(),
        sellerName: v.string(),
        status: listingStatus,
        views: v.number(),
        searchText: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const listing of args.listings) {
      // Validators turn `undefined` optionals into missing fields, so this is a clean insert.
      await ctx.db.insert("listings", listing);
    }
  },
});

/** Deletes up to 25 demo listings with their photos, favorites and conversations. */
export const deleteBatch = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ deleted: number; done: boolean }> => {
    const LIMIT = 25;
    const seeded = await ctx.db
      .query("listings")
      // ";" sorts right after ":", so this range is every sellerId starting with "seed:".
      .withIndex("by_seller", (i) => i.gte("sellerId", SEED_PREFIX).lt("sellerId", "seed;"))
      .take(LIMIT);
    const legacy =
      seeded.length < LIMIT
        ? await ctx.db
            .query("listings")
            .withIndex("by_seller", (i) => i.eq("sellerId", LEGACY_SELLER))
            .take(LIMIT - seeded.length)
        : [];

    for (const listing of [...seeded, ...legacy]) {
      for (const storageId of listing.images) {
        await ctx.storage.delete(storageId);
      }
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_listing", (i) => i.eq("listingId", listing._id))
        .collect();
      for (const f of favorites) await ctx.db.delete(f._id);

      const conversations = await ctx.db
        .query("conversations")
        .withIndex("by_listing_buyer", (i) => i.eq("listingId", listing._id))
        .collect();
      for (const c of conversations) {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (i) => i.eq("conversationId", c._id))
          .collect();
        for (const m of messages) await ctx.db.delete(m._id);
        await ctx.db.delete(c._id);
      }
      await ctx.db.delete(listing._id);
    }

    const deleted = seeded.length + legacy.length;
    return { deleted, done: deleted < LIMIT };
  },
});
