import { api } from "@ofry/backend/convex/_generated/api";
import { cn } from "@ofry/ui/lib/utils";
import { Link, Outlet, createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ImageOff, MessageCircle } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_auth/messages")({
  component: MessagesLayout,
});

function MessagesLayout() {
  const conversations = useQuery(api.messages.conversations);
  const { conversationId } = useParams({ strict: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Mesaje</h1>
      <div className="panel grid min-h-[70vh] overflow-hidden md:grid-cols-[320px_1fr]">
        <aside className={cn("border-r", conversationId && "hidden md:block")}>
          {conversations === undefined ? (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={<MessageCircle />} title="Nicio conversație">
                Când scrii unui vânzător sau primești un mesaj, conversația apare aici.
              </EmptyState>
            </div>
          ) : (
            <ul className="max-h-[70vh] overflow-y-auto">
              {conversations.map((c) => (
                <li key={c._id}>
                  <Link
                    to="/messages/$conversationId"
                    params={{ conversationId: c._id }}
                    className={cn(
                      "flex gap-3 border-b px-3 py-3 hover:bg-muted/60",
                      conversationId === c._id && "bg-brand-soft",
                    )}
                  >
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <ImageOff className="size-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className={cn("truncate text-sm", c.unread ? "font-bold" : "font-medium")}>{c.otherName}</span>
                        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{timeAgo(c.lastMessageAt)}</span>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{c.listingTitle}</div>
                      <div className={cn("truncate text-xs", c.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                        {c.lastMessage}
                      </div>
                    </div>
                    {c.unread && <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" aria-label="Necitit" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <section className={cn("min-w-0", !conversationId && "hidden md:block")}>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
