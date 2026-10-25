import { api } from "@ofry/backend/convex/_generated/api";
import { cn } from "@ofry/ui/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ImageOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { errorMessage, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_auth/messages/$conversationId")({
  component: ConversationPage,
});

function formatTime(ts: number) {
  const d = new Date(ts);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

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

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex items-center gap-3 border-b px-3 py-2">
        <Link to="/messages" className="btn btn-ghost w-9 px-0 md:hidden" aria-label="Înapoi">
          <ArrowLeft />
        </Link>
        <Link to="/listing/$id" params={{ id: thread.listingId }} className="flex min-w-0 items-center gap-3 hover:underline">
          <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
            {thread.imageUrl ? (
              <img src={thread.imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <ImageOff className="size-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{thread.otherName}</div>
            <div className="truncate text-xs text-muted-foreground">
              {thread.listingTitle}
              {thread.listingPrice !== undefined && ` · ${formatPrice(thread.listingPrice)}`}
              {thread.listingStatus === "sold" && " · Vândut"}
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {thread.messages.map((m) => (
          <div key={m._id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                m.mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted",
              )}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className={cn("mt-0.5 text-[10px]", m.mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {formatTime(m._creationTime)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          className="field h-10 min-h-10 resize-none py-2"
          rows={1}
          placeholder="Scrie un mesaj..."
          aria-label="Mesaj"
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button type="submit" className="btn btn-primary w-10 px-0" aria-label="Trimite" disabled={!body.trim()}>
          <Send />
        </button>
      </form>
    </div>
  );
}
