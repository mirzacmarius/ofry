import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const listingStatus = v.union(v.literal("active"), v.literal("sold"), v.literal("inactive"));
export const messageKind = v.union(v.literal("text"), v.literal("offer"), v.literal("image"));
export const offerStatus = v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"));
export const reportReason = v.union(
  v.literal("fraud"),
  v.literal("sold"),
  v.literal("duplicate"),
  v.literal("wrong_category"),
  v.literal("prohibited"),
  v.literal("other"),
);
export const notificationKind = v.union(
  v.literal("offer"),
  v.literal("offer_answer"),
  v.literal("price_drop"),
  v.literal("saved_search"),
  v.literal("expiring"),
);
/** The filters of a search, as in the /search URL. */
export const searchParams = {
  q: v.optional(v.string()),
  category: v.optional(v.string()),
  subcategory: v.optional(v.string()),
  county: v.optional(v.string()),
  condition: v.optional(v.union(v.literal("new"), v.literal("used"))),
  minPrice: v.optional(v.number()),
  maxPrice: v.optional(v.number()),
};
export const listingCondition = v.union(v.literal("new"), v.literal("used"));

export const listingFields = {
  title: v.string(),
  description: v.string(),
  /** Price in whole RON. 0 means "free". */
  price: v.number(),
  negotiable: v.boolean(),
  category: v.string(),
  subcategory: v.string(),
  condition: v.optional(listingCondition),
  county: v.string(),
  city: v.string(),
  images: v.array(v.id("_storage")),
  phone: v.optional(v.string()),
  // Category specific attributes
  year: v.optional(v.number()),
  mileage: v.optional(v.number()),
  fuel: v.optional(v.string()),
  gearbox: v.optional(v.string()),
  rooms: v.optional(v.number()),
  area: v.optional(v.number()),
};

export default defineSchema({
  listings: defineTable({
    ...listingFields,
    sellerId: v.string(),
    sellerName: v.string(),
    status: listingStatus,
    views: v.number(),
    /** Title + description + city, used by the full text search index. */
    searchText: v.string(),
    /** Price before the latest reduction, shown crossed out. Cleared when the price goes back up. */
    previousPrice: v.optional(v.number()),
    priceDroppedAt: v.optional(v.number()),
    /** Active listings are hidden after this time unless renewed. Missing means never. */
    expiresAt: v.optional(v.number()),
    /** Set once the "expires soon" notification went out for the current period. */
    expiryNotified: v.optional(v.boolean()),
    /** Set when the listing was switched off because it expired. */
    expiredAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_status_category", ["status", "category"])
    .index("by_status_price", ["status", "price"])
    .index("by_status_category_price", ["status", "category", "price"])
    .index("by_seller", ["sellerId"])
    .index("by_status_expires", ["status", "expiresAt"])
    .searchIndex("search_text", {
      searchField: "searchText",
      filterFields: ["status", "category", "county"],
    }),

  /** Public seller profile, next to the Better Auth user (which holds name and email). */
  profiles: defineTable({
    userId: v.string(),
    phone: v.optional(v.string()),
    county: v.optional(v.string()),
    city: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarId: v.optional(v.id("_storage")),
  }).index("by_user", ["userId"]),

  /** Views per listing per day (day = days since 1970, UTC), for the seller charts. */
  dailyViews: defineTable({
    listingId: v.id("listings"),
    sellerId: v.string(),
    day: v.number(),
    views: v.number(),
  })
    .index("by_listing_day", ["listingId", "day"])
    .index("by_seller_day", ["sellerId", "day"]),

  favorites: defineTable({
    userId: v.string(),
    listingId: v.id("listings"),
  })
    .index("by_user", ["userId"])
    .index("by_user_listing", ["userId", "listingId"])
    .index("by_listing", ["listingId"]),

  conversations: defineTable({
    listingId: v.id("listings"),
    listingTitle: v.string(),
    buyerId: v.string(),
    buyerName: v.string(),
    sellerId: v.string(),
    sellerName: v.string(),
    lastMessage: v.string(),
    lastMessageAt: v.number(),
    lastSenderId: v.string(),
    buyerLastReadAt: v.number(),
    sellerLastReadAt: v.number(),
  })
    .index("by_buyer", ["buyerId", "lastMessageAt"])
    .index("by_seller", ["sellerId", "lastMessageAt"])
    .index("by_listing_buyer", ["listingId", "buyerId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    body: v.string(),
    /** Missing means a plain text message. */
    kind: v.optional(messageKind),
    /** For kind "offer": the amount in lei and what the seller answered. */
    offerAmount: v.optional(v.number()),
    offerStatus: v.optional(offerStatus),
    /** For kind "image": the uploaded photo. */
    imageId: v.optional(v.id("_storage")),
  }).index("by_conversation", ["conversationId"]),

  savedSearches: defineTable({
    userId: v.string(),
    ...searchParams,
    /** Send a notification when new listings match. */
    notify: v.boolean(),
    /** Listings that matched since the user last opened this search. */
    newCount: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"]),

  notifications: defineTable({
    userId: v.string(),
    kind: notificationKind,
    title: v.string(),
    body: v.string(),
    listingId: v.optional(v.id("listings")),
    conversationId: v.optional(v.id("conversations")),
    savedSearchId: v.optional(v.id("savedSearches")),
    /** How many events this row stands for (new matches are grouped). */
    count: v.optional(v.number()),
    read: v.boolean(),
    /** Updated when a grouped notification gets a new event. */
    at: v.number(),
  })
    .index("by_user", ["userId", "at"])
    .index("by_user_read", ["userId", "read", "at"])
    .index("by_saved_search", ["savedSearchId", "read"]),

  reports: defineTable({
    listingId: v.id("listings"),
    reporterId: v.string(),
    reason: reportReason,
    details: v.string(),
  })
    .index("by_listing", ["listingId"])
    .index("by_reporter_listing", ["reporterId", "listingId"]),
});
