import { api } from "@ofry/backend/convex/_generated/api";
import { ChatComposer, DateDivider, MessageBubble, QuickReplies } from "@ofry/ui/components/ofry-chat";
import { Avatar } from "@ofry/ui/components/ofry-market";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ImageOff } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { clockTime, dayLabel, errorMessage, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_auth/messages/$conversationId")({
  component: ConversationPage,
});

const REPLIES = {
  buyer: ["Mai este disponibil?", "Care e prețul final?", "Unde se poate ridica?", "Se poate livra?"],
  seller: ["Da, e disponibil.", "Prețul e ușor negociabil.", "Când poți trece să-l vezi?", "Pot trimite prin curier."],
} as const;

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const thread = useQuery(api.messages.thread, { conversationId });
  const send = useMutation(api.messages.send);
  const markRead = useMutation(api.messages.markRead);
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const count = thread?.messages.length ?? 0;
  const threadId = thread?._id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
    if (threadId) markRead({ conversationId: threadId }).catch(() => {});
  }, [count, threadId, markRead]);

  if (thread === undefined) return <Loader />;
  if (thread === null) return <p className="p-10 text-center text-muted-foreground">Conversația nu a fost găsită.</p>;

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    setBody("");
    try {
      await send({ conversationId: thread._id, body: text });
    } catch (err) {
      setBody(text);
      toast.error(errorMessage(err));
    }
  };

  const otherReadAt = thread.otherReadAt ?? 0;
  const last = thread.messages.at(-1);
  // Offer quick replies when it's your turn to answer and you haven't started typing.
  const showReplies = !body && thread.role && (!last || !last.mine) && thread.listingStatus === "active";

  return (
    <div className="flex h-[calc(100dvh-9.75rem)] flex-col md:h-full">
      <div className="flex items-center gap-3 border-b border-border px-3 py-2.5">
        <Link to="/messages" className="btn btn-ghost btn-icon -ml-1 md:hidden" aria-label="Înapoi">
          <ArrowLeft />
        </Link>
        <Avatar name={thread.otherName} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{thread.otherName}</div>
          <div className="truncate text-xs text-muted-foreground">{thread.role === "seller" ? "Cumpărător interesat" : "Vânzător"}</div>
        </div>
      </div>

      <Link
        to="/listing/$id"
        params={{ id: thread.listingId }}
        className="surface mx-3 mt-3 flex items-center gap-3 rounded-2xl p-2 pr-3 transition hover:bg-surface-strong"
      >
        <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-background">
          {thread.imageUrl ? (
            <img src={thread.imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-4" />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{thread.listingTitle}</span>
          {thread.listingPrice !== undefined && <span className="block text-sm font-bold text-price">{formatPrice(thread.listingPrice)}</span>}
        </span>
        {thread.listingStatus === "sold" && <span className="badge badge-dark">Vândut</span>}
        {thread.listingStatus === "inactive" && <span className="badge">Dezactivat</span>}
      </Link>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-4">
        {thread.messages.map((m, i) => {
          const prev = thread.messages[i - 1];
          const newDay = !prev || new Date(prev._creationTime).toDateString() !== new Date(m._creationTime).toDateString();
          return (
            <Fragment key={m._id}>
              {newDay && <DateDivider>{dayLabel(m._creationTime)}</DateDivider>}
              <MessageBubble mine={m.mine} time={clockTime(m._creationTime)} status={m.mine ? (m._creationTime <= otherReadAt ? "read" : "sent") : undefined}>
                <span className="break-words whitespace-pre-wrap">{m.body}</span>
              </MessageBubble>
            </Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-2 border-t border-border p-3">
        {showReplies && <QuickReplies replies={[...REPLIES[thread.role]]} onPick={setBody} />}
        <ChatComposer value={body} onValueChange={setBody} onSubmit={submit} disabled={!body.trim()} maxLength={2000} />
      </div>
    </div>
  );
}
