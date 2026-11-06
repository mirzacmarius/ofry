import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { COUNTIES, DAY_MS } from "./lib/constants";
import { getProfile } from "./lib/profile";
import { getUser, requireUser } from "./lib/session";

const DELETED_NAME = "Cont șters";

/** The signed in user's profile, with what's needed for the completeness ring. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;
    const profile = await getProfile(ctx, user.id);
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_seller", (i) => i.eq("sellerId", user.id))
      .first();
    return {
      ...user,
      phone: profile?.phone ?? "",
      county: profile?.county ?? "",
      city: profile?.city ?? "",
      bio: profile?.bio ?? "",
      avatarUrl: profile?.avatarId ? await ctx.storage.getUrl(profile.avatarId) : null,
      hasListing: !!listing,
    };
  },
});

async function upsertProfile(ctx: MutationCtx, userId: string, patch: Record<string, unknown>) {
  const existing = await getProfile(ctx, userId);
  if (existing) await ctx.db.patch(existing._id, patch);
  else await ctx.db.insert("profiles", { userId, ...patch });
}

export const updateProfile = mutation({
  args: { phone: v.string(), county: v.string(), city: v.string(), bio: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const phone = args.phone.trim();
    if (phone && !/^\+?[\d\s.-]{9,16}$/.test(phone)) throw new ConvexError("Numărul de telefon nu pare valid.");
    if (args.county && !COUNTIES.includes(args.county)) throw new ConvexError("Județul nu este valid.");
    if (args.bio.length > 500) throw new ConvexError("Descrierea poate avea cel mult 500 de caractere.");
    await upsertProfile(ctx, user.id, {
      phone: phone || undefined,
      county: args.county || undefined,
      city: args.city.trim().slice(0, 80) || undefined,
      bio: args.bio.trim() || undefined,
    });
  },
});

/** Sets (or with null removes) the profile photo uploaded through files.generateUploadUrl. */
export const setAvatar = mutation({
  args: { storageId: v.union(v.id("_storage"), v.null()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (args.storageId) {
      const file = await ctx.db.system.get("_storage", args.storageId);
      if (!file?.contentType?.startsWith("image/") || file.size > 8 * 1024 * 1024) {
        if (file) await ctx.storage.delete(args.storageId);
        throw new ConvexError("Alege o imagine de cel mult 8 MB.");
      }
    }
    const existing = await getProfile(ctx, user.id);
    if (existing?.avatarId && existing.avatarId !== args.storageId) await ctx.storage.delete(existing.avatarId);
    await upsertProfile(ctx, user.id, { avatarId: args.storageId ?? undefined });
  },
});

/** After renaming the account: update the name shown on the user's listings and chats. */
export const syncName = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (i) => i.eq("sellerId", user.id))
      .collect();
    for (const l of listings) if (l.sellerName !== user.name) await ctx.db.patch(l._id, { sellerName: user.name });
    await renameInConversations(ctx, user.id, user.name);
  },
});

async function renameInConversations(ctx: MutationCtx, userId: string, name: string) {
  const [asBuyer, asSeller] = await Promise.all([
    ctx.db.query("conversations").withIndex("by_buyer", (i) => i.eq("buyerId", userId)).collect(),
    ctx.db.query("conversations").withIndex("by_seller", (i) => i.eq("sellerId", userId)).collect(),
  ]);
  for (const c of asBuyer) if (c.buyerName !== name) await ctx.db.patch(c._id, { buyerName: name });
  for (const c of asSeller) if (c.sellerName !== name) await ctx.db.patch(c._id, { sellerName: name });
}

/** Seller dashboard: totals and the last 14 days for views, saves and new buyers. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;
    const DAYS = 14;
    const today = Math.floor(Date.now() / DAY_MS);
    const from = today - DAYS + 1;
    const series = () => Array.from({ length: DAYS }, () => 0);

    const views = series();
    const daily = await ctx.db
      .query("dailyViews")
      .withIndex("by_seller_day", (i) => i.eq("sellerId", user.id).gte("day", from))
      .collect();
    for (const d of daily) views[d.day - from]! += d.views;

    const listings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (i) => i.eq("sellerId", user.id))
      .collect();
    const saves = series();
    let totalSaves = 0;
    for (const l of listings) {
      const favs = await ctx.db
        .query("favorites")
        .withIndex("by_listing", (i) => i.eq("listingId", l._id))
        .collect();
      totalSaves += favs.length;
      for (const f of favs) {
        const day = Math.floor(f._creationTime / DAY_MS);
        if (day >= from) saves[day - from]! += 1;
      }
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_seller", (i) => i.eq("sellerId", user.id))
      .collect();
    const buyers = series();
    for (const c of conversations) {
      const day = Math.floor(c._creationTime / DAY_MS);
      if (day >= from) buyers[day - from]! += 1;
    }

    /** Last 7 days against the 7 before, in percent. */
    const delta = (s: number[]) => {
      const recent = s.slice(7).reduce((a, b) => a + b, 0);
      const before = s.slice(0, 7).reduce((a, b) => a + b, 0);
      return before === 0 ? undefined : Math.round(((recent - before) / before) * 100);
    };
    // Cumulative views read better as a rising line.
    const cumulative = (s: number[]) => s.map((_, i) => s.slice(0, i + 1).reduce((a, b) => a + b, 0));

    return {
      views: { total: listings.reduce((a, l) => a + l.views, 0), data: cumulative(views), delta: delta(views) },
      saves: { total: totalSaves, data: cumulative(saves), delta: delta(saves) },
      buyers: { total: conversations.length, data: cumulative(buyers), delta: delta(buyers) },
      sold: listings.filter((l) => l.status === "sold").length,
      active: listings.filter((l) => l.status === "active").length,
    };
  },
});

/**
 * Removes everything the app stores about a user. Called by Better Auth just
 * before it deletes the account (see auth.ts). Conversations stay for the
 * other person, with the name replaced.
 */
export const purgeUserData = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (i) => i.eq("sellerId", userId))
      .collect();
    for (const l of listings) {
      for (const img of l.images) await ctx.storage.delete(img);
      await deleteAll(ctx, "favorites", await ctx.db.query("favorites").withIndex("by_listing", (i) => i.eq("listingId", l._id)).collect());
      await deleteAll(ctx, "reports", await ctx.db.query("reports").withIndex("by_listing", (i) => i.eq("listingId", l._id)).collect());
      await deleteAll(ctx, "dailyViews", await ctx.db.query("dailyViews").withIndex("by_listing_day", (i) => i.eq("listingId", l._id)).collect());
      await ctx.db.delete(l._id);
    }
    await deleteAll(ctx, "favorites", await ctx.db.query("favorites").withIndex("by_user", (i) => i.eq("userId", userId)).collect());
    await deleteAll(ctx, "savedSearches", await ctx.db.query("savedSearches").withIndex("by_user", (i) => i.eq("userId", userId)).collect());
    await deleteAll(ctx, "notifications", await ctx.db.query("notifications").withIndex("by_user", (i) => i.eq("userId", userId)).collect());
    await deleteAll(ctx, "reports", await ctx.db.query("reports").withIndex("by_reporter_listing", (i) => i.eq("reporterId", userId)).collect());
    const profile = await getProfile(ctx, userId);
    if (profile) {
      if (profile.avatarId) await ctx.storage.delete(profile.avatarId);
      await ctx.db.delete(profile._id);
    }
    await renameInConversations(ctx, userId, DELETED_NAME);
  },
});

async function deleteAll<T extends "favorites" | "reports" | "dailyViews" | "savedSearches" | "notifications">(
  ctx: MutationCtx,
  _table: T,
  rows: { _id: Id<T> }[],
) {
  for (const r of rows) await ctx.db.delete(r._id);
}
