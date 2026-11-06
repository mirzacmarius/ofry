import { api } from "@ofry/backend/convex/_generated/api";
import { ConversationRow } from "@ofry/ui/components/ofry-chat";
import { Segmented } from "@ofry/ui/components/ofry-forms";
import { cn } from "@ofry/ui/lib/utils";
import { Link, Outlet, createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { shortTime } from "@/lib/format";

export const Route = createFileRoute("/_auth/messages")({
  component: MessagesLayout,
});

type Filter = "all" | "buyer" | "seller";

function MessagesLayout() {
  const conversations = useQuery(api.messages.conversations);
  const { conversationId } = useParams({ strict: false });
  const [filter, setFilter] = useState<Filter>("all");

  const unread = conversations?.filter((c) => c.unread).length ?? 0;
  const shown = conversations?.filter((c) => filter === "all" || c.role === filter) ?? [];

  return (
    <div className="container-page py-4 sm:py-6">
      <div className={cn("mb-4 flex items-center gap-3", conversationId && "hidden md:flex")}>
        <h1 className="text-heading font-semibold">Mesaje</h1>
        {unread > 0 && <span className="badge badge-brand">{unread === 1 ? "1 nou" : `${unread} noi`}</span>}
      </div>
      <div className="grid gap-4 md:h-[calc(100dvh-11rem)] md:min-h-[560px] md:grid-cols-[340px_1fr]">
        <aside className={cn("panel flex min-h-0 flex-col p-2", conversationId && "hidden md:flex")}>
          {conversations === undefined ? (
            <div className="space-y-2 p-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="surface h-[4.5rem] animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <EmptyState icon={<MessageCircle />} title="Nicio conversație" className="my-auto bg-transparent">
              Când scrii unui vânzător sau primești un mesaj, conversația apare aici.
            </EmptyState>
          ) : (
            <>
              <Segmented<Filter>
                options={[
                  { value: "all", label: "Toate" },
                  { value: "buyer", label: "Cumpăr" },
                  { value: "seller", label: "Vând" },
                ]}
                value={filter}
                onValueChange={setFilter}
                size="sm"
                className="mx-1 mt-1 mb-2"
              />
              <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
                {shown.map((c) => (
                  <li key={c._id}>
                    <Link to="/messages/$conversationId" params={{ conversationId: c._id }} className="block rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                      <ConversationRow
                        name={c.otherName}
                        listing={c.listingDeleted ? `${c.listingTitle} · șters` : c.listingTitle}
                        last={c.lastMessage}
                        time={shortTime(c.lastMessageAt)}
                        unread={c.unread}
                        thumb={c.imageUrl}
                        active={conversationId === c._id}
                      />
                    </Link>
                  </li>
                ))}
                {shown.length === 0 && (
                  <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                    {filter === "buyer" ? "Nu ai scris încă niciunui vânzător." : "Nimeni nu ți-a scris încă despre anunțurile tale."}
                  </li>
                )}
              </ul>
            </>
          )}
        </aside>
        <section className={cn("panel min-h-0 min-w-0 overflow-hidden", !conversationId && "hidden md:block")}>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
