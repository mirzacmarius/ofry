import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { ChatComposer, DateDivider, MessageBubble, OfferBubble, QuickReplies } from "@ofry/ui/components/ofry-chat";
import { Avatar } from "@ofry/ui/components/ofry-market";
import { cn } from "@ofry/ui/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, HandCoins, ImageOff, Loader2 } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { OfferDialog } from "@/components/offer-dialog";
import { clockTime, dayLabel, errorMessage, formatPrice, uploadErrorMessage } from "@/lib/format";
import { uploadImage } from "@/lib/upload";

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
  const sendImage = useMutation(api.messages.sendImage);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const respond = useMutation(api.messages.respondToOffer);
  const markRead = useMutation(api.messages.markRead);
  const [body, setBody] = useState("");
  const [offering, setOffering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [answering, setAnswering] = useState<Id<"messages">>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const attach = async (file: File) => {
    setUploading(true);
    try {
      const storageId = await uploadImage(file, generateUploadUrl);
      await sendImage({ conversationId: thread._id, storageId, body: body.trim() || undefined });
      setBody("");
    } catch (err) {
      toast.error(uploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const answer = async (messageId: Id<"messages">, accept: boolean) => {
    setAnswering(messageId);
    try {
      await respond({ messageId, accept });
      toast.success(accept ? "Ai acceptat oferta" : "Ai refuzat oferta");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setAnswering(undefined);
    }
  };

  const active = thread.listingStatus === "active";
  const canOffer = thread.role === "buyer" && active && thread.listingNegotiable && (thread.listingPrice ?? 0) > 0;
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
              {m.kind === "offer" ? (
                <OfferBubble
                  mine={m.mine}
                  amount={m.offerAmount ?? 0}
                  listPrice={thread.listingPrice}
                  status={m.offerStatus}
                  actions={
                    !m.mine && thread.role === "seller" && active ? (
                      <>
                        <button type="button" className="btn btn-secondary btn-sm" disabled={answering === m._id} onClick={() => answer(m._id, false)}>
                          Refuză
                        </button>
                        <button type="button" className="btn btn-primary btn-sm" disabled={answering === m._id} onClick={() => answer(m._id, true)}>
                          Acceptă
                        </button>
                      </>
                    ) : undefined
                  }
                />
              ) : (
                <MessageBubble
                  mine={m.mine}
                  time={clockTime(m._creationTime)}
                  status={m.mine ? (m._creationTime <= otherReadAt ? "read" : "sent") : undefined}
                  className={cn(m.kind === "image" && "[&>div]:p-1.5 [&>div]:pb-2")}
                >
                  {m.kind === "image" && (
                    <a href={m.imageUrl ?? undefined} target="_blank" rel="noreferrer" className="block">
                      {m.imageUrl ? (
                        <img
                          src={m.imageUrl}
                          alt="Fotografie trimisă"
                          onLoad={() => bottomRef.current?.scrollIntoView({ block: "end" })}
                          className="max-h-72 w-full rounded-[1.25rem] object-cover" />
                      ) : (
                        <span className="flex h-32 w-48 items-center justify-center rounded-[1.25rem] bg-background/20">
                          <ImageOff className="size-6" />
                        </span>
                      )}
                    </a>
                  )}
                  {m.body && <span className={cn("block break-words whitespace-pre-wrap", m.kind === "image" && "px-2.5 pt-1.5")}>{m.body}</span>}
                </MessageBubble>
              )}
            </Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-2 border-t border-border p-3">
        {showReplies && <QuickReplies replies={[...REPLIES[thread.role]]} onPick={setBody} />}
        <ChatComposer
          value={body}
          onValueChange={setBody}
          onSubmit={submit}
          disabled={!body.trim()}
          maxLength={2000}
          onAttach={uploading ? undefined : () => fileRef.current?.click()}
          start={
            <>
              {uploading && <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" aria-label="Se trimite fotografia" />}
              {canOffer && (
                <button type="button" aria-label="Fă o ofertă" title="Fă o ofertă" className="btn btn-ghost btn-icon shrink-0 rounded-full text-brand-ink" onClick={() => setOffering(true)}>
                  <HandCoins />
                </button>
              )}
            </>
          }
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) attach(file);
            e.target.value = "";
          }}
        />
      </div>
      {canOffer && thread.listingPrice !== undefined && (
        <OfferDialog open={offering} onClose={() => setOffering(false)} listingId={thread.listingId} price={thread.listingPrice} />
      )}
    </div>
  );
}
