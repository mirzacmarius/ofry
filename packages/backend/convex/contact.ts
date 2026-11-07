import { ConvexError, v } from "convex/values";

import { mutation } from "./_generated/server";
import { getUser } from "./lib/session";

export const send = mutation({
  args: { name: v.string(), email: v.string(), topic: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim().slice(0, 100);
    const email = args.email.trim().slice(0, 200);
    const body = args.body.trim();
    if (!name) throw new ConvexError("Scrie-ți numele.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ConvexError("Adresa de email nu este validă.");
    if (body.length < 10) throw new ConvexError("Mesajul este prea scurt.");
    if (body.length > 5000) throw new ConvexError("Mesajul poate avea cel mult 5000 de caractere.");
    const user = await getUser(ctx);
    await ctx.db.insert("contactMessages", { name, email, topic: args.topic.slice(0, 50), body, userId: user?.id });
  },
});
