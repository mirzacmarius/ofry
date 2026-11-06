import { cn } from "@ofry/ui/lib/utils";
import { Star } from "lucide-react";
import type * as React from "react";

/**
 * Deep forest-green promotional banner. Use at most one per screen, for
 * Ofry's own messages (publish for free, safety tips, seasonal campaigns).
 */
function PromoBanner({
  title,
  description,
  action,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      data-slot="promo-banner"
      className={cn(
        "relative isolate flex items-center gap-4 overflow-hidden rounded-2xl bg-promo px-5 py-5 text-promo-foreground sm:px-8 sm:py-7",
        className,
      )}
      {...props}
    >
      <svg
        aria-hidden
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-3/4 text-promo-highlight"
      >
        <path d="M120 0 C 200 60, 260 40, 400 0 L 400 200 L 0 200 C 120 170, 70 70, 120 0 Z" fill="currentColor" opacity="0.55" />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="text-lg leading-tight font-semibold sm:text-2xl">{title}</div>
        {description && <div className="mt-1 text-sm text-promo-foreground/75 sm:text-base">{description}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Section title with an optional trailing action, usually a "Vezi toate" link. */
function SectionHeader({
  title,
  action,
  className,
  as: Heading = "h2",
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-4", className)}>
      <Heading className="text-heading font-semibold">{title}</Heading>
      {action && <div className="shrink-0 text-sm font-medium">{action}</div>}
    </div>
  );
}

/** Five-star rating with numeric score and optional review count. */
function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="font-semibold">{value.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}</span>
      {count !== undefined && <span className="text-sm text-muted-foreground">({count})</span>}
      <span className="flex gap-0.5" aria-label={`${value} din 5 stele`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            aria-hidden
            className={cn("size-4", i < rounded ? "fill-rating text-rating" : "fill-surface-strong text-surface-strong")}
          />
        ))}
      </span>
    </div>
  );
}

/** Pagination dots for photo carousels; the active dot stretches into a pill. */
function ImageDots({ count, active, className }: { count: number; active: number; className?: string }) {
  if (count < 2) return null;
  return (
    <div className={cn("flex items-center justify-center gap-1", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === active ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25",
          )}
        />
      ))}
    </div>
  );
}

export { ImageDots, PromoBanner, Rating, SectionHeader };
