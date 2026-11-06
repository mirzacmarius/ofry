import { ConvexError, v } from "convex/values";

import type { WithoutSystemFields } from "convex/server";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { formatLei } from "./lib/constants";
import { getUser, requireUser, type SessionUser } from "./lib/session";

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

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type MessageFields = Omit<WithoutSystemFields<Doc<"messages">>, "conversationId" | "senderId">;

/** One line for the inbox preview. */
function preview(m: MessageFields) {
  if (m.kind === "offer") return `Ofertă: ${formatLei(m.offerAmount ?? 0)}`;
  if (m.kind === "image") return m.body ? `Fotografie: ${m.body}` : "Fotografie";
  return m.body;
}

/** Finds the buyer's conversation about a listing, or starts one. */
async function conversationFor(ctx: MutationCtx, listing: Doc<"listings">, user: SessionUser) {
  if (listing.status !== "active") throw new ConvexError("Anunțul nu mai este disponibil.");
  if (listing.sellerId === user.id) throw new ConvexError("Nu îți poți trimite mesaje ție.");
  const existing = await ctx.db
    .query("conversations")
    .withIndex("by_listing_buyer", (i) => i.eq("listingId", listing._id).eq("buyerId", user.id))
    .unique();
  if (existing) return existing;
  const now = Date.now();
  const id = await ctx.db.insert("conversations", {
    listingId: listing._id,
    listingTitle: listing.title,
    buyerId: user.id,
    buyerName: user.name,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    lastMessage: "",
    lastMessageAt: now,
    lastSenderId: user.id,
    buyerLastReadAt: now,
    sellerLastReadAt: 0,
  });
  return (await ctx.db.get(id))!;
}

/** The conversation, if the user takes part in it. */
async function ownConversation(ctx: MutationCtx, conversationId: Id<"conversations">, user: SessionUser) {
  const c = await ctx.db.get(conversationId);
  if (!c || (c.buyerId !== user.id && c.sellerId !== user.id)) {
    throw new ConvexError("Conversația nu a fost găsită.");
  }
  return c;
}

/** Adds a message and moves the conversation to the top of both inboxes. */
async function post(ctx: MutationCtx, c: Doc<"conversations">, senderId: string, fields: MessageFields) {
  const now = Date.now();
  const messageId = await ctx.db.insert("messages", { conversationId: c._id, senderId, ...fields });
  await ctx.db.patch(c._id, {
    lastMessage: preview(fields),
    lastMessageAt: now,
    lastSenderId: senderId,
    ...(c.buyerId === senderId ? { buyerLastReadAt: now } : { sellerLastReadAt: now }),
  });
  return messageId;
}

function cleanAmount(amount: number, listing: Doc<"listings">) {
  const value = Math.round(amount);
  if (!Number.isFinite(amount) || value <= 0) throw new ConvexError("Oferta trebuie să fie mai mare de 0 lei.");
  if (!listing.negotiable || listing.price === 0) throw new ConvexError("Vânzătorul nu acceptă oferte pentru acest anunț.");
  if (value >= listing.price) throw new ConvexError("Oferta trebuie să fie sub prețul afișat.");
  return value;
}

/** Contact the seller about a listing. Reuses the existing conversation if there is one. */
export const contactSeller = mutation({
  args: { listingId: v.id("listings"), body: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const body = cleanBody(args.body);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new ConvexError("Anunțul nu mai este disponibil.");
    const c = await conversationFor(ctx, listing, user);
    await post(ctx, c, user.id, { body });
    return c._id;
  },
});

export const send = mutation({
  args: { conversationId: v.id("conversations"), body: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const body = cleanBody(args.body);
    const c = await ownConversation(ctx, args.conversationId, user);
    await post(ctx, c, user.id, { body });
  },
});

/** Send a photo (uploaded with files.generateUploadUrl) with an optional caption. */
export const sendImage = mutation({
  args: { conversationId: v.id("conversations"), storageId: v.id("_storage"), body: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const c = await ownConversation(ctx, args.conversationId, user);
    const file = await ctx.db.system.get("_storage", args.storageId);
    if (!file || !file.contentType?.startsWith("image/") || file.size > MAX_IMAGE_BYTES) {
      if (file) await ctx.storage.delete(args.storageId);
      throw new ConvexError("Poți trimite doar imagini de cel mult 8 MB.");
    }
    const body = (args.body ?? "").trim().slice(0, 2000);
    await post(ctx, c, user.id, { body, kind: "image", imageId: args.storageId });
  },
});

/**
 * Buyer offers a lower price. Works from the listing page (starts the
 * conversation if needed) and from inside the chat.
 */
export const makeOffer = mutation({
  args: { listingId: v.id("listings"), amount: v.number() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new ConvexError("Anunțul nu mai este disponibil.");
    const amount = cleanAmount(args.amount, listing);
    const c = await conversationFor(ctx, listing, user);
    // Only one open offer at a time: a new one replaces the previous.
    const pending = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (i) => i.eq("conversationId", c._id))
      .filter((f) => f.eq(f.field("offerStatus"), "pending"))
      .collect();
    for (const m of pending) await ctx.db.patch(m._id, { offerStatus: "declined" });
    await post(ctx, c, user.id, { body: "", kind: "offer", offerAmount: amount, offerStatus: "pending" });
    return c._id;
  },
});

/** Seller accepts or declines an offer. */
export const respondToOffer = mutation({
  args: { messageId: v.id("messages"), accept: v.boolean() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const m = await ctx.db.get(args.messageId);
    if (!m || m.kind !== "offer") throw new ConvexError("Oferta nu a fost găsită.");
    const c = await ownConversation(ctx, m.conversationId, user);
    if (c.sellerId !== user.id) throw new ConvexError("Doar vânzătorul poate răspunde la ofertă.");
    if (m.offerStatus !== "pending") throw new ConvexError("Ai răspuns deja la această ofertă.");
    await ctx.db.patch(m._id, { offerStatus: args.accept ? "accepted" : "declined" });
    const amount = formatLei(m.offerAmount ?? 0);
    await post(ctx, c, user.id, {
      body: args.accept
        ? `Am acceptat oferta de ${amount}. Hai să stabilim cum facem predarea.`
        : `Mulțumesc pentru ofertă, dar ${amount} e prea puțin pentru mine.`,
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
      listingNegotiable: listing?.negotiable ?? false,
      listingStatus: listing?.status,
      imageUrl: listing?.images[0] ? await ctx.storage.getUrl(listing.images[0]) : null,
      otherName: c.buyerId === user.id ? c.sellerName : c.buyerName,
      role: c.buyerId === user.id ? ("buyer" as const) : ("seller" as const),
      /** When the other person last opened the conversation, for read ticks. */
      otherReadAt: c.buyerId === user.id ? c.sellerLastReadAt : c.buyerLastReadAt,
      me: user.id,
      messages: await Promise.all(
        messages.map(async (m) => ({
          _id: m._id,
          _creationTime: m._creationTime,
          body: m.body,
          kind: m.kind ?? ("text" as const),
          offerAmount: m.offerAmount,
          offerStatus: m.offerStatus,
          imageUrl: m.imageId ? await ctx.storage.getUrl(m.imageId) : null,
          mine: m.senderId === user.id,
        })),
      ),
    };
  },
});
