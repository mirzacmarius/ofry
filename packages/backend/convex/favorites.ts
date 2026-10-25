import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { toCard } from "./lib/cards";
import { getUser, requireUser } from "./lib/session";

export const toggle = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_listing", (i) => i.eq("userId", user.id).eq("listingId", args.listingId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("favorites", { userId: user.id, listingId: args.listingId });
    return true;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (i) => i.eq("userId", user.id))
      .order("desc")
      .collect();
    const listings = await Promise.all(
      favorites.map(async (f) => {
        const l = await ctx.db.get(f.listingId);
        if (!l || l.status === "inactive") return null;
        return await toCard(ctx, l);
      }),
    );
    return listings.filter((l) => l !== null);
  },
});
