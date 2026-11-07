import type { QueryCtx } from "../_generated/server";

export async function getProfile(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("profiles")
    .withIndex("by_user", (i) => i.eq("userId", userId))
    .unique();
}

/** What other people see about a seller. */
export async function publicProfile(ctx: QueryCtx, userId: string) {
  const p = await getProfile(ctx, userId);
  return {
    avatarUrl: p?.avatarId ? await ctx.storage.getUrl(p.avatarId) : null,
    bio: p?.bio ?? null,
    city: p?.city ?? null,
    county: p?.county ?? null,
  };
}
