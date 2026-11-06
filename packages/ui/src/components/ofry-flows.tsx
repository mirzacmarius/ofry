import { cn } from "@ofry/ui/lib/utils";
import { ArrowUpLeft, Camera, Check, Clock, GripVertical, ImagePlus, Search, Star, TrendingUp, X } from "lucide-react";
import type * as React from "react";

/* ------------------------------------------------------------------ */
/* Photo uploader                                                      */
/* ------------------------------------------------------------------ */

/**
 * Photo grid for the posting flow: the first photo is the cover, others can
 * be dragged, empty slots invite more, and a tip shows how many are left.
 */
function PhotoUploader({
  photos,
  max = 8,
  uploading = 0,
  onAdd,
  onRemove,
  className,
}: {
  photos: string[];
  max?: number;
  uploading?: number;
  onAdd?: () => void;
  onRemove?: (i: number) => void;
  className?: string;
}) {
  const empty = Math.max(0, max - photos.length - uploading);
  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((src, i) => (
          <div
            key={src}
            className={cn("group relative overflow-hidden rounded-2xl bg-surface", i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square")}
          >
            <img src={src} alt="" className="size-full object-cover" />
            {i === 0 && (
              <span className="badge badge-highlight absolute bottom-2 left-2">
                <Star /> Copertă
              </span>
            )}
            <span className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 transition group-hover:opacity-100">
              <GripVertical className="size-4" />
            </span>
            <button
              type="button"
              aria-label="Șterge poza"
              onClick={() => onRemove?.(i)}
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-ink/80 text-ink-foreground transition hover:bg-ink"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        {Array.from({ length: uploading }, (_, i) => (
          <div key={`u${i}`} className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
            <div className="absolute inset-0 animate-pulse bg-linear-to-br from-brand-soft to-surface" />
            <div className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-background/70">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
          </div>
        ))}
        {empty > 0 && (
          <button
            type="button"
            onClick={onAdd}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-primary/40 bg-brand-soft/50 text-brand-ink transition hover:border-primary hover:bg-brand-soft"
          >
            <ImagePlus className="size-6" />
            <span className="text-xs font-semibold">Adaugă poze</span>
          </button>
        )}
        {Array.from({ length: Math.max(0, empty - 1) }, (_, i) => (
          <div key={`e${i}`} className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground/40">
            <Camera className="size-5" />
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {photos.length}/{max} poze · Prima poză apare în rezultate. Anunțurile cu 5+ poze primesc de 2× mai multe mesaje.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Category choice                                                     */
/* ------------------------------------------------------------------ */

/** Selectable pastel tile with a check when chosen (posting flow, onboarding interests). */
function ChoiceTile({
  icon,
  label,
  tint = "lavender",
  selected,
  onSelect,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  tint?: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      style={{ "--tile-tint": `var(--ofry-tint-${tint})` } as React.CSSProperties}
      className={cn(
        "tile-tinted relative flex flex-col items-start gap-6 rounded-2xl p-4 text-left ring-2 transition outline-none focus-visible:ring-ring",
        selected ? "ring-primary" : "ring-transparent",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-background/70 [&_svg]:size-6">{icon}</span>
      <span className="text-sm leading-tight font-semibold">{label}</span>
      <span
        className={cn(
          "absolute top-3 right-3 flex size-6 items-center justify-center rounded-full transition",
          selected ? "scale-100 bg-primary text-primary-foreground" : "scale-75 bg-background/70 text-transparent",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Search suggestions                                                  */
/* ------------------------------------------------------------------ */

/** Dropdown under the search bar: recent searches, trending, category matches. */
function SearchSuggest({
  query,
  recent,
  trending,
  matches,
  className,
}: {
  query?: string;
  recent?: string[];
  trending?: string[];
  matches?: { label: string; category: string; count: number }[];
  className?: string;
}) {
  const highlight = (text: string) => {
    if (!query) return text;
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i < 0) return text;
    return (
      <>
        {text.slice(0, i)}
        <span className="font-semibold text-foreground">{text.slice(i, i + query.length)}</span>
        {text.slice(i + query.length)}
      </>
    );
  };
  return (
    <div className={cn("w-full overflow-hidden rounded-3xl bg-card p-2 shadow-lg ring-1 ring-border", className)}>
      <div className="flex h-12 items-center gap-3 rounded-2xl bg-surface px-4">
        <Search className="size-5 text-muted-foreground" />
        <span className={cn("flex-1 text-[0.9375rem]", !query && "text-muted-foreground")}>{query || "Caută pe Ofry"}</span>
        {query && <span className="h-5 w-px animate-pulse bg-primary" />}
      </div>
      {matches && matches.length > 0 && (
        <ul className="mt-2">
          {matches.map((m) => (
            <li key={m.label + m.category} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {highlight(m.label)} <span className="text-brand-ink">în {m.category}</span>
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">{m.count.toLocaleString("ro-RO")}</span>
            </li>
          ))}
        </ul>
      )}
      {recent && recent.length > 0 && (
        <div className="mt-2 px-3 pt-2">
          <div className="mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Recente</div>
          <ul>
            {recent.map((r) => (
              <li key={r} className="-mx-3 flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-surface">
                <Clock className="size-4 text-muted-foreground" />
                <span className="flex-1">{r}</span>
                <ArrowUpLeft className="size-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {trending && trending.length > 0 && (
        <div className="mt-2 px-3 pt-2 pb-2">
          <div className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">În trend azi</div>
          <div className="flex flex-wrap gap-1.5">
            {trending.map((t, i) => (
              <span key={t} className="chip chip-sm">
                {i < 2 && <TrendingUp className="text-brand-ink" />}
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { ChoiceTile, PhotoUploader, SearchSuggest };
