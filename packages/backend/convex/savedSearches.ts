import { ConvexError, v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import { getCategory } from "./lib/constants";
import { notifyGrouped } from "./lib/notify";
import { filterKey, matchesSearch } from "./lib/searchMatch";
import { getUser, requireUser } from "./lib/session";
import { searchParams } from "./schema";

const MAX_SAVED = 30;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("savedSearches")
      .withIndex("by_user", (i) => i.eq("userId", user.id))
      .order("desc")
      .take(MAX_SAVED);
    return rows.map((r) => ({ ...r, key: filterKey(r) }));
  },
});

export const save = mutation({
  args: searchParams,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const params = { ...args, q: args.q?.trim() || undefined };
    if (!Object.values(params).some((x) => x !== undefined)) {
      throw new ConvexError("Alege cel puțin un filtru sau scrie ce cauți.");
    }
    if (params.category && !getCategory(params.category)) throw new ConvexError("Categoria nu este validă.");
    const mine = await ctx.db
      .query("savedSearches")
      .withIndex("by_user", (i) => i.eq("userId", user.id))
      .collect();
    const existing = mine.find((s) => filterKey(s) === filterKey(params));
    if (existing) return existing._id;
    if (mine.length >= MAX_SAVED) throw new ConvexError(`Poți salva cel mult ${MAX_SAVED} căutări.`);
    return await ctx.db.insert("savedSearches", { userId: user.id, ...params, notify: true, newCount: 0, lastSeenAt: Date.now() });
  },
});

async function owned(ctx: Parameters<typeof requireUser>[0], id: import("./_generated/dataModel").Id<"savedSearches">) {
  const user = await requireUser(ctx);
  const s = await ctx.db.get(id);
  if (!s || s.userId !== user.id) throw new ConvexError("Căutarea nu a fost găsită.");
  return s;
}

export const remove = mutation({
  args: { id: v.id("savedSearches") },
  handler: async (ctx, args) => {
    await owned(ctx, args.id);
    await ctx.db.delete(args.id);
  },
});

export const setNotify = mutation({
  args: { id: v.id("savedSearches"), notify: v.boolean() },
  handler: async (ctx, args) => {
    await owned(ctx, args.id);
    await ctx.db.patch(args.id, { notify: args.notify });
  },
});

/** Opening a saved search clears its "new" count and its notification. */
export const markSeen = mutation({
  args: { id: v.id("savedSearches") },
  handler: async (ctx, args) => {
    await owned(ctx, args.id);
    await ctx.db.patch(args.id, { newCount: 0, lastSeenAt: Date.now() });
    const open = await ctx.db
      .query("notifications")
      .withIndex("by_saved_search", (i) => i.eq("savedSearchId", args.id).eq("read", false))
      .collect();
    for (const n of open) await ctx.db.patch(n._id, { read: true });
  },
});

/** Runs after a listing is published: bumps every saved search it matches. */
export const onListingCreated = internalMutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) return;
    const [inCategory, anyCategory] = await Promise.all([
      ctx.db.query("savedSearches").withIndex("by_category", (i) => i.eq("category", listing.category)).take(2000),
      ctx.db.query("savedSearches").withIndex("by_category", (i) => i.eq("category", undefined)).take(2000),
    ]);
    for (const s of [...inCategory, ...anyCategory]) {
      if (s.userId === listing.sellerId || !matchesSearch(listing, s)) continue;
      await ctx.db.patch(s._id, { newCount: s.newCount + 1 });
      if (!s.notify) continue;
      const what = s.q ? `„${s.q}”` : (getCategory(s.category)?.name ?? "căutarea ta");
      await notifyGrouped(ctx, { userId: s.userId, kind: "saved_search", title: "", body: "", savedSearchId: s._id, listingId: listing._id }, (count) => ({
        title: count === 1 ? "Un anunț nou" : `${count} anunțuri noi`,
        body: `pentru ${what}${s.county ? ` în ${s.county}` : ""}`,
      }));
    }
  },
});
