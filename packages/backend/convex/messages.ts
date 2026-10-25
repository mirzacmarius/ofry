import { ConvexError, v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getUser, requireUser } from "./lib/session";

function cleanBody(body: string) {
  const text = body.trim();
  if (!text) throw new ConvexError("Mesajul este gol.");
  if (text.length > 2000) throw new ConvexError("Mesajul poate avea cel mult 2000 de caractere.");
  return text;
}

function isUnread(c: Doc<"conversations">, userId: string) {
  if (c.lastSenderId === userId) return false;
  const lastRead = c.buyerId === userId ? c.buyerLastReadAt : c.sellerLastReadAt;
  return c.lastMessageAt > lastRead;
}

/** Contact the seller about a listing. Reuses the existing conversation if there is one. */
export const contactSeller = mutation({
  args: { listingId: v.id("listings"), body: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const body = cleanBody(args.body);
    const listing = await ctx.db.get(args.listingId);
    if (!listing || listing.status !== "active") {
      throw new ConvexError("Anunțul nu mai este disponibil.");
    }
    if (listing.sellerId === user.id) {
      throw new ConvexError("Nu îți poți trimite mesaje ție.");
    }
    const now = Date.now();
    let conversation = await ctx.db
      .query("conversations")
      .withIndex("by_listing_buyer", (i) => i.eq("listingId", listing._id).eq("buyerId", user.id))
      .unique();
    const conversationId =
      conversation?._id ??
      (await ctx.db.insert("conversations", {
        listingId: listing._id,
        listingTitle: listing.title,
        buyerId: user.id,
        buyerName: user.name,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        lastMessage: body,
        lastMessageAt: now,
        lastSenderId: user.id,
        buyerLastReadAt: now,
        sellerLastReadAt: 0,
      }));
    if (conversation) {
      await ctx.db.patch(conversation._id, {
        lastMessage: body,
        lastMessageAt: now,
        lastSenderId: user.id,
        buyerLastReadAt: now,
      });
    }
    await ctx.db.insert("messages", { conversationId, senderId: user.id, body });
    return conversationId;
  },
});

export const send = mutation({
  args: { conversationId: v.id("conversations"), body: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const body = cleanBody(args.body);
    const c = await ctx.db.get(args.conversationId);
    if (!c || (c.buyerId !== user.id && c.sellerId !== user.id)) {
      throw new ConvexError("Conversația nu a fost găsită.");
    }
    const now = Date.now();
    await ctx.db.insert("messages", { conversationId: c._id, senderId: user.id, body });
    await ctx.db.patch(c._id, {
      lastMessage: body,
      lastMessageAt: now,
      lastSenderId: user.id,
      ...(c.buyerId === user.id ? { buyerLastReadAt: now } : { sellerLastReadAt: now }),
    });
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const c = await ctx.db.get(args.conversationId);
    if (!c) return;
    const now = Date.now();
    if (c.buyerId === user.id) await ctx.db.patch(c._id, { buyerLastReadAt: now });
    else if (c.sellerId === user.id) await ctx.db.patch(c._id, { sellerLastReadAt: now });
  },
});

export const conversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];
    const [asBuyer, asSeller] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_buyer", (i) => i.eq("buyerId", user.id))
        .order("desc")
        .take(200),
      ctx.db
        .query("conversations")
        .withIndex("by_seller", (i) => i.eq("sellerId", user.id))
        .order("desc")
        .take(200),
    ]);
    const all = [...asBuyer, ...asSeller].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    return await Promise.all(
      all.map(async (c) => {
        const listing = await ctx.db.get(c.listingId);
        const imageUrl = listing?.images[0] ? await ctx.storage.getUrl(listing.images[0]) : null;
        return {
          _id: c._id,
          listingId: c.listingId,
          listingTitle: listing?.title ?? c.listingTitle,
          listingDeleted: !listing,
          imageUrl,
          otherName: c.buyerId === user.id ? c.sellerName : c.buyerName,
          role: c.buyerId === user.id ? ("buyer" as const) : ("seller" as const),
          lastMessage: c.lastMessage,
          lastMessageAt: c.lastMessageAt,
          unread: isUnread(c, user.id),
        };
      }),
    );
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return 0;
    const [asBuyer, asSeller] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_buyer", (i) => i.eq("buyerId", user.id))
        .take(200),
      ctx.db
        .query("conversations")
        .withIndex("by_seller", (i) => i.eq("sellerId", user.id))
        .take(200),
    ]);
    return [...asBuyer, ...asSeller].filter((c) => isUnread(c, user.id)).length;
  },
});

export const thread = query({
  args: { conversationId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return null;
    const id = ctx.db.normalizeId("conversations", args.conversationId);
    if (!id) return null;
    const c = await ctx.db.get(id);
    if (!c || (c.buyerId !== user.id && c.sellerId !== user.id)) return null;
    const listing = await ctx.db.get(c.listingId);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (i) => i.eq("conversationId", id))
      .take(1000);
    return {
      _id: c._id,
      listingId: c.listingId,
      listingTitle: listing?.title ?? c.listingTitle,
      listingPrice: listing?.price,
      listingStatus: listing?.status,
      imageUrl: listing?.images[0] ? await ctx.storage.getUrl(listing.images[0]) : null,
      otherName: c.buyerId === user.id ? c.sellerName : c.buyerName,
      me: user.id,
      messages: messages.map((m) => ({
        _id: m._id,
        _creationTime: m._creationTime,
        body: m.body,
        mine: m.senderId === user.id,
      })),
    };
  },
});
