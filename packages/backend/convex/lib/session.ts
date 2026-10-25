import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";

export type SessionUser = { id: string; name: string; email: string };

export async function getUser(ctx: QueryCtx | MutationCtx): Promise<SessionUser | null> {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) return null;
  return { id: String(user._id), name: user.name || user.email.split("@")[0]!, email: user.email };
}

export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<SessionUser> {
  const user = await getUser(ctx);
  if (!user) throw new ConvexError("Trebuie să fii autentificat.");
  return user;
}
