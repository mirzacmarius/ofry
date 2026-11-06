import { cn } from "@ofry/ui/lib/utils";
import { Check, CheckCheck, HandCoins, Paperclip, SendHorizontal, Smile } from "lucide-react";
import type * as React from "react";

import { TypingDots } from "./ofry-feedback";
import { Avatar, formatLei } from "./ofry-market";

/** Chat bubble: violet for mine (tail bottom-right), grey for theirs. */
function MessageBubble({
  mine,
  children,
  time,
  status,
  className,
}: {
  mine?: boolean;
  children: React.ReactNode;
  time?: string;
  status?: "sent" | "read";
  className?: string;
}) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start", className)}>
      <div
        className={cn(
          "max-w-[78%] rounded-3xl px-4 py-2.5 text-[0.9375rem] leading-snug",
          mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-surface",
        )}
      >
        {children}
        {time && (
          <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {time}
            {mine && status === "read" && <CheckCheck className="size-3.5 text-highlight" />}
            {mine && status === "sent" && <Check className="size-3.5" />}
          </div>
        )}
      </div>
    </div>
  );
}

/** A price offer inside the conversation, with its state and actions. */
function OfferBubble({
  mine,
  amount,
  listPrice,
  status = "pending",
  actions,
  className,
}: {
  mine?: boolean;
  amount: number;
  listPrice?: number;
  status?: "pending" | "accepted" | "declined";
  actions?: React.ReactNode;
  className?: string;
}) {
  const statusLabel = { pending: "Așteaptă răspuns", accepted: "Ofertă acceptată", declined: "Ofertă refuzată" }[status];
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start", className)}>
      <div className="w-64 overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
        <div className="flex items-center gap-3 bg-linear-to-br from-promo to-promo-to p-4 text-promo-foreground">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/15">
            <HandCoins className="size-5" />
          </span>
          <div>
            <div className="text-xs text-promo-foreground/80">{mine ? "Oferta ta" : "Ofertă primită"}</div>
            <div className="text-xl font-bold tabular-nums">{formatLei(amount)}</div>
          </div>
        </div>
        <div className="p-3">
          {listPrice !== undefined && (
            <div className="mb-2 text-xs text-muted-foreground">
              Preț afișat <span className="line-through">{formatLei(listPrice)}</span>
            </div>
          )}
          <span
            className={cn(
              "badge",
              status === "accepted" && "bg-emerald-500 text-white",
              status === "declined" && "bg-destructive/10 text-destructive",
              status === "pending" && "badge-highlight",
            )}
          >
            {statusLabel}
          </span>
          {actions && status === "pending" && <div className="mt-3 grid grid-cols-2 gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

function TypingBubble({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 items-center rounded-3xl rounded-bl-md bg-surface px-4 text-muted-foreground">
        <TypingDots />
      </span>
      {name && <span className="text-xs text-muted-foreground">{name} scrie…</span>}
    </div>
  );
}

function DateDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1 text-[11px] font-medium text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function QuickReplies({ replies, onPick, className }: { replies: string[]; onPick?: (r: string) => void; className?: string }) {
  return (
    <div className={cn("scroll-rail mx-0 scroll-px-0 gap-2 px-0", className)}>
      {replies.map((r) => (
        <button key={r} type="button" onClick={() => onPick?.(r)} className="chip chip-sm bg-brand-soft text-brand-ink hover:bg-brand-soft/70">
          {r}
        </button>
      ))}
    </div>
  );
}

/** Message composer: optional attach and emoji, a pill input and a round send button. */
function ChatComposer({
  placeholder = "Scrie un mesaj…",
  value,
  onValueChange,
  onSubmit,
  disabled,
  maxLength,
  extras,
  onAttach,
  start,
  className,
}: {
  placeholder?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  maxLength?: number;
  /** Show the attach and emoji buttons as a static preview (design catalog). */
  extras?: boolean;
  /** Shows a working attach button. */
  onAttach?: () => void;
  /** Buttons before the input, e.g. "make an offer". */
  start?: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      className={cn("flex items-center gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {(extras || onAttach) && (
        <button type="button" aria-label="Trimite o fotografie" onClick={onAttach} className="btn btn-ghost btn-icon shrink-0 rounded-full">
          <Paperclip />
        </button>
      )}
      {start}
      <div className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-surface pr-1 pl-4 transition focus-within:bg-background focus-within:ring-3 focus-within:ring-ring/25">
        <input
          placeholder={placeholder}
          aria-label="Mesaj"
          value={value}
          maxLength={maxLength}
          onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
          readOnly={value !== undefined && !onValueChange}
          className="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground"
        />
        {extras && (
          <button type="button" aria-label="Emoji" className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground">
            <Smile className="size-5" />
          </button>
        )}
      </div>
      <button
        type="submit"
        aria-label="Trimite"
        disabled={disabled}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition active:scale-95 disabled:opacity-50 disabled:shadow-none"
      >
        <SendHorizontal className="size-5" />
      </button>
    </form>
  );
}

/** Inbox row: avatar, who, which listing, last line, time and unread count. */
function ConversationRow({
  name,
  listing,
  last,
  time,
  unread = 0,
  online,
  thumb,
  typing,
  active,
  className,
}: {
  name: string;
  listing: string;
  last: string;
  time: string;
  /** A count shows a pill; `true` shows a dot. */
  unread?: number | boolean;
  online?: boolean;
  thumb?: string | null;
  typing?: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl p-3 transition hover:bg-surface", active && "bg-brand-soft", className)}>
      <span className="relative">
        <Avatar name={name} size="md" online={online} />
        {thumb && <img src={thumb} alt="" className="absolute -right-1 -bottom-1 size-6 rounded-md object-cover ring-2 ring-background" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-sm", unread ? "font-bold" : "font-semibold")}>{name}</span>
          <span className={cn("shrink-0 text-[11px]", unread ? "font-semibold text-brand-ink" : "text-muted-foreground")}>{time}</span>
        </div>
        <div className="truncate text-xs text-muted-foreground">{listing}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm", unread ? "text-foreground" : "text-muted-foreground")}>
            {typing ? <span className="font-medium text-brand-ink">scrie…</span> : last}
          </span>
          {typeof unread === "number" && unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{unread}</span>
          )}
          {unread === true && <span className="size-2.5 shrink-0 rounded-full bg-primary" aria-label="Necitit" />}
        </div>
      </div>
    </div>
  );
}

export { ChatComposer, ConversationRow, DateDivider, MessageBubble, OfferBubble, QuickReplies, TypingBubble };
