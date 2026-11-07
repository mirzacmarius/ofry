import { ConvexError, v } from "convex/values";

import { internalQuery, mutation, query } from "./_generated/server";
import { getUser, requireUser } from "./lib/session";
import { reportReason } from "./schema";

/** Report a listing. Reporting the same listing again updates your earlier report. */
export const create = mutation({
  args: { listingId: v.id("listings"), reason: reportReason, details: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new ConvexError("Anunțul nu a fost găsit.");
    if (listing.sellerId === user.id) throw new ConvexError("Nu îți poți raporta propriul anunț.");
    const details = (args.details ?? "").trim().slice(0, 1000);
    if (args.reason === "other" && details.length < 5) {
      throw new ConvexError("Spune-ne pe scurt ce nu e în regulă.");
    }
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_reporter_listing", (i) => i.eq("reporterId", user.id).eq("listingId", args.listingId))
      .unique();
    if (existing) await ctx.db.patch(existing._id, { reason: args.reason, details });
    else await ctx.db.insert("reports", { listingId: args.listingId, reporterId: user.id, reason: args.reason, details });
  },
});

/** Whether the signed in user already reported this listing. */
export const mine = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return false;
    const r = await ctx.db
      .query("reports")
      .withIndex("by_reporter_listing", (i) => i.eq("reporterId", user.id).eq("listingId", args.listingId))
      .unique();
    return !!r;
  },
});

/**
 * Newest reports with their listing, for moderation from the Convex dashboard
 * (Functions → reports:recent → Run).
 */
export const recent = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const reports = await ctx.db.query("reports").order("desc").take(Math.min(args.limit ?? 50, 200));
    return await Promise.all(
      reports.map(async (r) => {
        const listing = await ctx.db.get(r.listingId);
        return {
          ...r,
          listingTitle: listing?.title ?? "(șters)",
          listingStatus: listing?.status ?? "deleted",
          sellerId: listing?.sellerId,
        };
      }),
    );
  },
});
