import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getUser, requireUser } from "./lib/session";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (i) => i.eq("userId", user.id))
      .order("desc")
      .take(60);
    return await Promise.all(
      rows.map(async (n) => {
        const listing = n.listingId ? await ctx.db.get(n.listingId) : null;
        const thumb = listing?.images[0] ? await ctx.storage.getUrl(listing.images[0]) : null;
        return { ...n, thumb };
      }),
    );
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return 0;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (i) => i.eq("userId", user.id).eq("read", false))
      .take(100);
    return unread.length;
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const n = await ctx.db.get(args.id);
    if (n && n.userId === user.id && !n.read) await ctx.db.patch(n._id, { read: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (i) => i.eq("userId", user.id).eq("read", false))
      .take(500);
    for (const n of unread) await ctx.db.patch(n._id, { read: true });
  },
});
