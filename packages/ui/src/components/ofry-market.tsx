import { cn } from "@ofry/ui/lib/utils";
import { BadgeCheck, Check, ChevronLeft, ChevronRight, Clock, Crown, MapPin, Sparkles, Star, TrendingDown, TrendingUp } from "lucide-react";
import type * as React from "react";

const lei = new Intl.NumberFormat("ro-RO");
const formatLei = (n: number) => (n === 0 ? "Gratuit" : `${lei.format(n)} lei`);

/* ------------------------------------------------------------------ */
/* Avatars                                                             */
/* ------------------------------------------------------------------ */

const AVATAR_TINTS = ["lavender", "butter", "mint", "peach", "sky", "pink", "periwinkle"];
const AVATAR_SIZES = { xs: "size-7 text-[10px]", sm: "size-9 text-xs", md: "size-12 text-sm", lg: "size-16 text-lg", xl: "size-24 text-2xl" };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Photo or pastel initials, with optional online dot and verified tick. */
function Avatar({
  name,
  src,
  size = "md",
  online,
  verified,
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof AVATAR_SIZES;
  online?: boolean;
  verified?: boolean;
  className?: string;
}) {
  const tint = AVATAR_TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TINTS.length];
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn("flex items-center justify-center overflow-hidden rounded-full font-bold text-neutral-900", AVATAR_SIZES[size])}
        style={{ background: `var(--ofry-tint-${tint})` }}
      >
        {src ? <img src={src} alt="" className="size-full object-cover" /> : initials(name)}
      </span>
      {online && <span className="absolute top-0 right-0 size-[28%] min-h-2.5 min-w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />}
      {verified && (
        <span className="absolute -right-0.5 -bottom-0.5 rounded-full bg-background p-px">
          <BadgeCheck className="size-[max(1rem,30%)] fill-primary text-primary-foreground" />
        </span>
      )}
    </span>
  );
}

function AvatarStack({ names, max = 4, size = "sm", className }: { names: string[]; max?: number; size?: keyof typeof AVATAR_SIZES; className?: string }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((n, i) => (
        <span key={n} className={cn("rounded-full ring-2 ring-background", i > 0 && "-ml-2.5")}>
          <Avatar name={n} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span className={cn("-ml-2.5 flex items-center justify-center rounded-full bg-primary font-bold text-primary-foreground ring-2 ring-background", AVATAR_SIZES[size])}>
          +{rest}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trust badges and seller card                                        */
/* ------------------------------------------------------------------ */

function TrustBadge({ icon, children, className }: { icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-brand-soft py-1 pr-3 pl-1 text-xs font-medium text-brand-ink", className)}>
      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground [&_svg]:size-3">{icon}</span>
      {children}
    </span>
  );
}

function SellerCard({
  name,
  avatar,
  memberSince,
  rating,
  reviews,
  responseTime,
  activeListings,
  badges,
  online,
  verified,
  actions,
  className,
}: {
  name: string;
  avatar?: string | null;
  memberSince: string;
  rating?: number;
  reviews?: number;
  responseTime?: string;
  activeListings?: number;
  badges?: React.ReactNode;
  online?: boolean;
  verified?: boolean;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("panel p-5", className)}>
      <div className="flex items-center gap-3">
        <Avatar name={name} src={avatar} size="lg" online={online} verified={verified} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">Pe Ofry din {memberSince}</div>
          {rating !== undefined && (
            <div className="mt-1 flex items-center gap-1 text-sm">
              <Star className="size-4 fill-rating text-rating" />
              <span className="font-semibold">{rating.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}</span>
              {reviews !== undefined && <span className="text-muted-foreground">· {reviews} recenzii</span>}
            </div>
          )}
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
        {responseTime && (
          <div className="surface rounded-xl px-2 py-2.5">
            <dt className="text-[11px] text-muted-foreground">Răspunde</dt>
            <dd className="text-sm font-semibold">{responseTime}</dd>
          </div>
        )}
        {activeListings !== undefined && (
          <div className="surface rounded-xl px-2 py-2.5">
            <dt className="text-[11px] text-muted-foreground">Anunțuri active</dt>
            <dd className="text-sm font-semibold">{activeListings}</dd>
          </div>
        )}
      </dl>
      {badges && <div className="mt-4 flex flex-wrap gap-1.5">{badges}</div>}
      {actions && <div className="mt-4 flex gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Prices                                                              */
/* ------------------------------------------------------------------ */

/** Price with optional old price, drop percentage and negotiable flag. */
function PriceTag({
  price,
  oldPrice,
  negotiable,
  size = "md",
  className,
}: {
  price: number;
  oldPrice?: number;
  negotiable?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const drop = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("font-bold text-price tabular-nums", size === "sm" ? "text-base" : size === "md" ? "text-xl" : "text-title")}>
        {formatLei(price)}
      </span>
      {drop > 0 && (
        <>
          <span className="text-sm text-muted-foreground tabular-nums line-through">{formatLei(oldPrice!)}</span>
          <span className="badge badge-highlight h-6 px-2">
            <TrendingDown /> −{drop}%
          </span>
        </>
      )}
      {negotiable && price > 0 && <span className="badge badge-brand h-6 px-2">Negociabil</span>}
    </div>
  );
}

/**
 * Where this price sits against similar listings: a gradient track from
 * "good deal" to "above market" with a marker and a verdict.
 */
function FairPriceMeter({ price, low, high, className }: { price: number; low: number; high: number; className?: string }) {
  const span = high - low;
  const pos = Math.max(2, Math.min(98, ((price - (low - span * 0.5)) / (span * 2)) * 100));
  const verdict =
    price < low
      ? { label: "Preț bun", tone: "bg-emerald-500 text-white", note: "Sub prețul anunțurilor similare" }
      : price > high
        ? { label: "Peste piață", tone: "bg-destructive text-white", note: "Mai scump decât anunțurile similare" }
        : { label: "Preț corect", tone: "bg-primary text-primary-foreground", note: "În linie cu anunțurile similare" };
  return (
    <div className={cn("surface p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Analiză preț</div>
          <div className="text-xs text-muted-foreground">{verdict.note}</div>
        </div>
        <span className={cn("badge h-7 font-semibold", verdict.tone)}>{verdict.label}</span>
      </div>
      <div className="relative mt-5 mb-1">
        <div className="h-2.5 rounded-full bg-linear-to-r from-emerald-400 via-primary to-destructive opacity-80" />
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos}%` }}>
          <div className="size-5 rounded-full border-4 border-background bg-ink shadow-md" />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>{formatLei(Math.round(low - span * 0.5))}</span>
        <span>
          Interval obișnuit: {formatLei(low)} – {formatLei(high)}
        </span>
        <span>{formatLei(Math.round(high + span * 0.5))}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Listing variants                                                    */
/* ------------------------------------------------------------------ */

/** Horizontal listing row for lists, my ads, chat headers. */
function ListingRow({
  image,
  title,
  price,
  meta,
  badges,
  trailing,
  className,
}: {
  image?: string | null;
  title: React.ReactNode;
  price: number;
  meta?: React.ReactNode;
  badges?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="surface size-20 shrink-0 overflow-hidden rounded-xl sm:size-24">
        {image && <img src={image} alt="" className="size-full object-cover" />}
      </span>
      <div className="min-w-0 flex-1">
        {badges && <div className="mb-1 flex flex-wrap gap-1">{badges}</div>}
        <div className="line-clamp-2 text-[0.9375rem] leading-snug font-medium">{title}</div>
        <div className="mt-0.5 font-bold text-price tabular-nums">{formatLei(price)}</div>
        {meta && <div className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</div>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}

/** Promoted listing: gradient ring, crown badge and a wide photo. */
function PromotedCard({
  image,
  title,
  price,
  meta,
  facts,
  className,
}: {
  image?: string | null;
  title: React.ReactNode;
  price: number;
  meta?: React.ReactNode;
  facts?: { icon: React.ReactNode; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("rounded-[1.6rem] bg-linear-to-br from-promo via-promo-to to-highlight p-[2px]", className)}>
      <div className="h-full rounded-[calc(1.6rem-2px)] bg-card p-3">
        <div className="surface relative aspect-[16/10] overflow-hidden">
          {image && <img src={image} alt="" className="size-full object-cover" />}
          <span className="badge badge-highlight absolute top-3 left-3 shadow-sm">
            <Crown /> Promovat
          </span>
        </div>
        <div className="px-1 pt-3 pb-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold">{title}</div>
              {meta && <div className="text-sm text-muted-foreground">{meta}</div>}
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[11px] text-muted-foreground">Preț</div>
              <div className="text-xl font-bold text-brand-ink tabular-nums">{formatLei(price)}</div>
            </div>
          </div>
          {facts && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {facts.map((f) => (
                <span key={f.label} className="flex items-center gap-1.5 text-foreground/80 [&_svg]:size-4 [&_svg]:text-muted-foreground">
                  {f.icon}
                  {f.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Icon + value facts row, for the top of a listing (3 camere · 72 m² · etaj 4). */
function KeyFacts({ facts, className }: { facts: { icon: React.ReactNode; label: string; value: string }[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      {facts.map((f) => (
        <div key={f.label} className="surface flex items-center gap-3 rounded-xl p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-brand-ink [&_svg]:size-[1.125rem]">{f.icon}</span>
          <div className="min-w-0">
            <dt className="truncate text-[11px] text-muted-foreground">{f.label}</dt>
            <dd className="truncate text-sm font-semibold">{f.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

/** Colour tile with a dark label pill, for curated collections. */
function CollectionTile({
  label,
  title,
  count,
  tint,
  art,
  className,
}: {
  label: string;
  title: string;
  count?: number;
  tint: "lavender" | "periwinkle" | "butter" | "mint" | "peach" | "sky" | "pink" | "slate" | "violet";
  art?: React.ReactNode;
  className?: string;
}) {
  const violet = tint === "violet";
  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col overflow-hidden rounded-3xl p-4",
        violet ? "bg-linear-to-br from-promo to-promo-to text-promo-foreground" : "tile-tinted text-foreground",
        className,
      )}
      style={violet ? undefined : ({ "--tile-tint": `var(--ofry-tint-${tint})` } as React.CSSProperties)}
    >
      <span className={cn("w-fit rounded-md px-2 py-1 text-[10px] font-semibold tracking-wider uppercase", violet ? "bg-highlight text-highlight-foreground" : "bg-ink text-ink-foreground")}>
        {label}
      </span>
      <div className="mt-auto">
        <div className="text-lg leading-tight font-semibold">{title}</div>
        {count !== undefined && <div className={cn("text-xs", violet ? "text-promo-foreground/80" : "text-muted-foreground")}>{lei.format(count)} anunțuri</div>}
      </div>
      {art && <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">{art}</div>}
    </div>
  );
}

/** "Expires in" pill that turns urgent under a day. */
function Countdown({ hoursLeft, className }: { hoursLeft: number; className?: string }) {
  const urgent = hoursLeft < 24;
  const label = hoursLeft < 1 ? "Expiră curând" : hoursLeft < 24 ? `Expiră în ${Math.round(hoursLeft)} h` : `Expiră în ${Math.round(hoursLeft / 24)} zile`;
  return (
    <span className={cn("badge", urgent ? "bg-destructive/10 text-destructive" : "", className)}>
      <Clock /> {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Boost plans                                                         */
/* ------------------------------------------------------------------ */

function PlanCard({
  name,
  price,
  period,
  features,
  popular,
  selected,
  cta,
  className,
}: {
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  selected?: boolean;
  cta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl p-5",
        popular ? "bg-linear-to-br from-promo to-promo-to text-promo-foreground shadow-lg" : "panel",
        selected && !popular && "border-2 border-primary",
        className,
      )}
    >
      {popular && (
        <span className="badge badge-highlight absolute -top-3 right-5 shadow-sm">
          <Sparkles /> Cel mai ales
        </span>
      )}
      <div className={cn("text-sm font-semibold", popular ? "text-promo-foreground/80" : "text-muted-foreground")}>{name}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums">{lei.format(price)}</span>
        <span className={cn("text-sm", popular ? "text-promo-foreground/80" : "text-muted-foreground")}>lei / {period}</span>
      </div>
      <ul className="mt-4 flex-1 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full", popular ? "bg-highlight text-highlight-foreground" : "bg-brand-soft text-brand-ink")}>
              <Check className="size-3" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Map preview                                                         */
/* ------------------------------------------------------------------ */

/** Stylised map tile with an approximate-area circle and a pin. */
function MapPreview({ place, detail, className }: { place: string; detail?: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-[var(--ofry-tint-sky)] dark:bg-surface", className)}>
      <svg viewBox="0 0 400 220" className="block h-auto w-full" aria-hidden>
        <rect width="400" height="220" fill="transparent" />
        <path d="M0 150 C 80 130, 120 170, 200 150 S 320 110, 400 130 L400 220 L0 220Z" fill="var(--ofry-tint-mint)" className="opacity-90 dark:opacity-15" />
        <path d="M250 0 C 240 60, 300 90, 290 140 S 330 200, 320 220" stroke="#9fc6ff" strokeWidth="14" fill="none" className="opacity-70 dark:opacity-30" />
        {[
          "M0 60 H400",
          "M0 110 H400",
          "M60 0 V220",
          "M150 0 V220",
          "M360 0 V220",
          "M0 0 L220 220",
        ].map((d) => (
          <path key={d} d={d} stroke="var(--background)" strokeWidth="6" opacity=".9" />
        ))}
        {[
          [80, 20, 50, 28],
          [170, 70, 60, 30],
          [20, 120, 30, 20],
          [300, 20, 45, 30],
          [170, 170, 40, 30],
        ].map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="6" fill="var(--background)" opacity=".55" />
        ))}
        <circle cx="200" cy="105" r="62" fill="var(--primary)" opacity=".14" />
        <circle cx="200" cy="105" r="62" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 6" opacity=".6" />
      </svg>
      <span className="absolute top-[47%] left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
          <MapPin className="size-5" />
        </span>
        <span className="-mt-1 size-3 rotate-45 bg-primary" />
      </span>
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{place}</div>
          {detail && <div className="truncate text-xs text-muted-foreground">{detail}</div>}
        </div>
        <span className="shrink-0 text-xs font-semibold text-brand-ink">Zonă aproximativă</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

function Sparkline({ data, className, fill = true }: { data: number[]; className?: string; fill?: boolean }) {
  const w = 120;
  const h = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - 3 - ((d - min) / (max - min || 1)) * (h - 6)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const id = `spark-${data.join("-")}`;
  const [lx, ly] = pts.at(-1)!;
  return (
    <span className={cn("relative block h-9 w-full", className)} aria-hidden>
      <svg viewBox={`0 0 ${w} ${h}`} className="size-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {fill && <path d={`${line} L${w} ${h} L0 ${h}Z`} fill={`url(#${id})`} />}
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background"
        style={{ left: `${(lx / w) * 100}%`, top: `${(ly / h) * 100}%` }}
      />
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  delta,
  data,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  delta?: number;
  data?: number[];
  className?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className={cn("panel flex flex-col gap-3 p-4", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon && <span className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand-ink [&_svg]:size-4">{icon}</span>}
        {label}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {delta !== undefined && (
          <span className={cn("flex items-center gap-0.5 text-xs font-semibold", up ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
            {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {up ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      {data && <Sparkline data={data} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

const NOTE_TONES = {
  brand: "bg-primary text-primary-foreground",
  highlight: "bg-highlight text-highlight-foreground",
  mint: "bg-[var(--ofry-tint-mint)] text-neutral-900",
  peach: "bg-[var(--ofry-tint-peach)] text-neutral-900",
} as const;

function NotificationItem({
  icon,
  tone = "brand",
  title,
  body,
  time,
  unread,
  thumb,
  className,
}: {
  icon: React.ReactNode;
  tone?: keyof typeof NOTE_TONES;
  title: React.ReactNode;
  body?: React.ReactNode;
  time: string;
  unread?: boolean;
  thumb?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl p-3 transition hover:bg-surface", unread && "bg-brand-soft/60", className)}>
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-[1.125rem]", NOTE_TONES[tone])}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm">
          <span className="font-semibold">{title}</span>
          {body && <span className="text-foreground/75"> {body}</span>}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{time}</div>
      </div>
      {thumb && <img src={thumb} alt="" className="size-12 shrink-0 rounded-lg object-cover" />}
      {unread && <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" aria-label="Necitit" />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step progress (posting flow)                                        */
/* ------------------------------------------------------------------ */

function StepProgress({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <ol className={cn("flex items-center", className)}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <span className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-bold transition",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary text-primary-foreground ring-4 ring-brand-soft",
                  !done && !active && "bg-surface text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("text-xs whitespace-nowrap", active ? "font-semibold" : "text-muted-foreground")}>{s}</span>
            </span>
            {i < steps.length - 1 && (
              <span className="mx-2 mb-6 h-1 flex-1 overflow-hidden rounded-full bg-surface">
                <span className={cn("block h-full rounded-full bg-primary transition-all", done ? "w-full" : "w-0")} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

function Pagination({ page, pages, onPage, className }: { page: number; pages: number; onPage?: (p: number) => void; className?: string }) {
  const list: (number | "…")[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) list.push(p);
    else if (list.at(-1) !== "…") list.push("…");
  }
  const btn = "flex size-10 items-center justify-center rounded-full text-sm font-semibold transition";
  return (
    <nav aria-label="Pagini" className={cn("flex items-center gap-1", className)}>
      <button type="button" aria-label="Pagina anterioară" disabled={page <= 1} onClick={() => onPage?.(page - 1)} className={cn(btn, "bg-surface hover:bg-surface-strong disabled:opacity-40")}>
        <ChevronLeft className="size-4" />
      </button>
      {list.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="w-6 text-center text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPage?.(p)}
            className={cn(btn, p === page ? "bg-primary text-primary-foreground" : "hover:bg-surface")}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" aria-label="Pagina următoare" disabled={page >= pages} onClick={() => onPage?.(page + 1)} className={cn(btn, "bg-surface hover:bg-surface-strong disabled:opacity-40")}>
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

export {
  Avatar,
  AvatarStack,
  CollectionTile,
  Countdown,
  FairPriceMeter,
  KeyFacts,
  ListingRow,
  MapPreview,
  NotificationItem,
  Pagination,
  PlanCard,
  PriceTag,
  PromotedCard,
  SellerCard,
  Sparkline,
  StatTile,
  StepProgress,
  TrustBadge,
  formatLei,
};
