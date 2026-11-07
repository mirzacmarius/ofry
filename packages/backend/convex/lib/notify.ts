import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type NewNotification = Pick<Doc<"notifications">, "userId" | "kind" | "title" | "body"> & {
  listingId?: Id<"listings">;
  conversationId?: Id<"conversations">;
  savedSearchId?: Id<"savedSearches">;
};

export async function notify(ctx: MutationCtx, n: NewNotification) {
  await ctx.db.insert("notifications", { ...n, read: false, at: Date.now() });
}

/** Folds repeated events (new matches for one saved search) into one unread row. */
export async function notifyGrouped(ctx: MutationCtx, n: NewNotification & { savedSearchId: Id<"savedSearches"> }, text: (count: number) => { title: string; body: string }) {
  const open = await ctx.db
    .query("notifications")
    .withIndex("by_saved_search", (i) => i.eq("savedSearchId", n.savedSearchId).eq("read", false))
    .first();
  if (open) {
    const count = (open.count ?? 1) + 1;
    await ctx.db.patch(open._id, { ...text(count), count, listingId: n.listingId, at: Date.now() });
  } else {
    await ctx.db.insert("notifications", { ...n, ...text(1), count: 1, read: false, at: Date.now() });
  }
}
