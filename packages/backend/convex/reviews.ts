import { ConvexError, v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { getUser, requireUser } from "./lib/session";

/** Average and count for a seller, used on listing and seller pages. */
export async function ratingSummary(ctx: QueryCtx, sellerId: string) {
  const rows = await ctx.db
    .query("reviews")
    .withIndex("by_seller", (i) => i.eq("sellerId", sellerId))
    .take(1000);
  if (rows.length === 0) return { rating: undefined, reviews: 0 };
  return { rating: rows.reduce((a, r) => a + r.rating, 0) / rows.length, reviews: rows.length };
}

/** The buyer can review once the seller has answered at least once. */
async function sellerReplied(ctx: QueryCtx, c: Doc<"conversations">) {
  const reply = await ctx.db
    .query("messages")
    .withIndex("by_conversation", (i) => i.eq("conversationId", c._id))
    .filter((f) => f.eq(f.field("senderId"), c.sellerId))
    .first();
  return !!reply;
}

export const forSeller = query({
  args: { sellerId: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_seller", (i) => i.eq("sellerId", args.sellerId))
      .order("desc")
      .take(50);
    const summary = await ratingSummary(ctx, args.sellerId);
    const breakdown = [5, 4, 3, 2, 1].map((stars) => rows.filter((r) => r.rating === stars).length);
    return {
      ...summary,
      breakdown,
      items: rows.map((r) => ({ _id: r._id, _creationTime: r._creationTime, reviewerName: r.reviewerName, listingTitle: r.listingTitle, rating: r.rating, text: r.text })),
    };
  },
});

/** For the chat: whether the buyer can leave a review, or the one they left. */
export const forConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const c = await ctx.db.get(args.conversationId);
    if (!user || !c || c.buyerId !== user.id) return { canReview: false as const };
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_conversation", (i) => i.eq("conversationId", c._id))
      .unique();
    if (existing) return { canReview: false as const, review: { rating: existing.rating, text: existing.text } };
    return { canReview: await sellerReplied(ctx, c) };
  },
});

export const create = mutation({
  args: { conversationId: v.id("conversations"), rating: v.number(), text: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const c = await ctx.db.get(args.conversationId);
    if (!c || c.buyerId !== user.id) throw new ConvexError("Poți evalua doar vânzătorii cu care ai vorbit.");
    if (!Number.isInteger(args.rating) || args.rating < 1 || args.rating > 5) throw new ConvexError("Alege între 1 și 5 stele.");
    const text = args.text.trim();
    if (text.length > 1000) throw new ConvexError("Recenzia poate avea cel mult 1000 de caractere.");
    if (!(await sellerReplied(ctx, c))) throw new ConvexError("Poți lăsa o recenzie după ce vânzătorul îți răspunde.");
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_conversation", (i) => i.eq("conversationId", c._id))
      .unique();
    if (existing) throw new ConvexError("Ai lăsat deja o recenzie pentru această conversație.");
    await ctx.db.insert("reviews", {
      sellerId: c.sellerId,
      reviewerId: user.id,
      reviewerName: user.name,
      conversationId: c._id,
      listingTitle: c.listingTitle,
      rating: args.rating,
      text,
    });
  },
});
