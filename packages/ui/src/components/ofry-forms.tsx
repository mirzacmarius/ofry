import { cn } from "@ofry/ui/lib/utils";
import { Check, Minus, Plus, Star } from "lucide-react";
import * as React from "react";

/** Keeps a value that is either controlled by the parent or owned locally. */
function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [local, setLocal] = React.useState(defaultValue);
  const current = value !== undefined ? value : local;
  const set = React.useCallback(
    (v: T) => {
      if (value === undefined) setLocal(v);
      onChange?.(v);
    },
    [value, onChange],
  );
  return [current, set] as const;
}

/* ------------------------------------------------------------------ */
/* Switch                                                              */
/* ------------------------------------------------------------------ */

/** Pill switch with a round knob; violet when on. */
function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  const id = React.useId();
  const toggle = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => setOn(!on)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50",
        on ? "bg-primary" : "bg-surface-strong",
      )}
    >
      <span
        className={cn(
          "size-6 rounded-full bg-white shadow-sm transition-transform duration-200",
          on ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
  if (!label) return <span className={className}>{toggle}</span>;
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </label>
      {toggle}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkbox                                                            */
/* ------------------------------------------------------------------ */

function Checkbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  count,
  className,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  label: React.ReactNode;
  count?: number;
  className?: string;
}) {
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  return (
    <label className={cn("group flex cursor-pointer items-center gap-3 py-1.5 text-sm", className)}>
      <input type="checkbox" className="peer sr-only" checked={on} onChange={(e) => setOn(e.target.checked)} />
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-3 peer-focus-visible:ring-ring/40",
          on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background group-hover:border-foreground/30",
        )}
      >
        {on && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count.toLocaleString("ro-RO")}</span>}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Radio cards                                                         */
/* ------------------------------------------------------------------ */

type RadioOption<V extends string> = {
  value: V;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
};

/** Big selectable cards (delivery method, boost plan, condition). */
function RadioCards<V extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  columns = 1,
  name,
  className,
}: {
  options: RadioOption<V>[];
  value?: V;
  defaultValue?: V;
  onValueChange?: (v: V) => void;
  columns?: 1 | 2 | 3;
  name?: string;
  className?: string;
}) {
  const [selected, setSelected] = useControllable<V | undefined>(value, defaultValue, onValueChange as (v: V | undefined) => void);
  const groupName = React.useId();
  return (
    <div
      role="radiogroup"
      className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-3", className)}
    >
      {options.map((o) => {
        const active = selected === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              "relative flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
              active ? "border-primary bg-brand-soft" : "border-border bg-background hover:border-foreground/20",
            )}
          >
            <input
              type="radio"
              name={name ?? groupName}
              value={o.value}
              checked={active}
              onChange={() => setSelected(o.value)}
              className="sr-only"
            />
            {o.icon && (
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5",
                  active ? "bg-primary text-primary-foreground" : "bg-surface",
                )}
              >
                {o.icon}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{o.label}</span>
              {o.description && <span className="mt-0.5 block text-sm text-muted-foreground">{o.description}</span>}
            </span>
            {o.aside && <span className="shrink-0 text-sm font-semibold">{o.aside}</span>}
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                active ? "border-primary" : "border-border",
              )}
            >
              {active && <span className="size-2.5 rounded-full bg-primary" />}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented control                                                   */
/* ------------------------------------------------------------------ */

/** iOS-style segmented control; the active segment is a white pill on grey. */
function Segmented<V extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  className,
}: {
  options: { value: V; label: React.ReactNode }[];
  value?: V;
  defaultValue?: V;
  onValueChange?: (v: V) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const [selected, setSelected] = useControllable<V>(value, defaultValue ?? options[0]!.value, onValueChange);
  return (
    <div role="tablist" className={cn("inline-flex rounded-full bg-surface p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={selected === o.value}
          onClick={() => setSelected(o.value)}
          className={cn(
            "flex-1 rounded-full font-medium whitespace-nowrap transition outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
            selected === o.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

/** Underlined tabs with an optional count pill (Detalii · Întrebări 6). */
function Tabs<V extends string>({
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
}: {
  tabs: { value: V; label: React.ReactNode; count?: number }[];
  value?: V;
  defaultValue?: V;
  onValueChange?: (v: V) => void;
  className?: string;
}) {
  const [selected, setSelected] = useControllable<V>(value, defaultValue ?? tabs[0]!.value, onValueChange);
  return (
    <div role="tablist" className={cn("flex gap-6 overflow-x-auto border-b border-border", className)}>
      {tabs.map((t) => {
        const active = selected === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setSelected(t.value)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 pt-1 pb-3 text-sm font-medium transition outline-none",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold",
                  active ? "bg-primary text-primary-foreground" : "bg-surface",
                )}
              >
                {t.count}
              </span>
            )}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quantity stepper                                                    */
/* ------------------------------------------------------------------ */

function Stepper({
  value,
  defaultValue = 1,
  onValueChange,
  min = 0,
  max = 99,
  suffix,
  className,
}: {
  value?: number;
  defaultValue?: number;
  onValueChange?: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  className?: string;
}) {
  const [n, setN] = useControllable(value, defaultValue, onValueChange);
  const btn =
    "flex size-9 items-center justify-center rounded-full bg-background shadow-xs transition hover:bg-brand-soft disabled:opacity-40 [&_svg]:size-4";
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full bg-surface p-1", className)}>
      <button type="button" aria-label="Mai puțin" className={btn} disabled={n <= min} onClick={() => setN(Math.max(min, n - 1))}>
        <Minus />
      </button>
      <span className="min-w-12 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {n}
        {suffix && <span className="font-normal text-muted-foreground"> {suffix}</span>}
      </span>
      <button type="button" aria-label="Mai mult" className={btn} disabled={n >= max} onClick={() => setN(Math.min(max, n + 1))}>
        <Plus />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Price range                                                         */
/* ------------------------------------------------------------------ */

/**
 * Two-thumb price slider over a histogram of how many listings sit at each
 * price, so buyers see where the market is before they drag.
 */
function PriceRange({
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  histogram,
  format = (n) => `${n.toLocaleString("ro-RO")} lei`,
  className,
}: {
  min: number;
  max: number;
  step?: number;
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (v: [number, number]) => void;
  histogram?: number[];
  format?: (n: number) => string;
  className?: string;
}) {
  const [range, setRange] = useControllable<[number, number]>(value, defaultValue ?? [min, max], onValueChange);
  const [lo, hi] = range;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const peak = histogram ? Math.max(...histogram) : 1;
  const thumb =
    "pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md";
  return (
    <div className={className}>
      {histogram && (
        <div className="flex h-14 items-end gap-[3px] px-3" aria-hidden>
          {histogram.map((h, i) => {
            const at = min + ((i + 0.5) / histogram.length) * (max - min);
            const inside = at >= lo && at <= hi;
            return (
              <span
                key={i}
                className={cn("flex-1 rounded-t-sm transition-colors", inside ? "bg-primary/70" : "bg-surface-strong")}
                style={{ height: `${Math.max(8, (h / peak) * 100)}%` }}
              />
            );
          })}
        </div>
      )}
      <div className="relative mx-3 h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-strong" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          aria-label="Preț minim"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => setRange([Math.min(Number(e.target.value), hi - step), hi])}
          className={cn(thumb, "-mx-3 w-[calc(100%+1.5rem)]")}
        />
        <input
          type="range"
          aria-label="Preț maxim"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => setRange([lo, Math.max(Number(e.target.value), lo + step)])}
          className={cn(thumb, "-mx-3 w-[calc(100%+1.5rem)]")}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="surface rounded-xl px-3 py-2">
          <div className="text-[11px] text-muted-foreground">De la</div>
          <div className="text-sm font-semibold tabular-nums">{format(lo)}</div>
        </div>
        <div className="surface rounded-xl px-3 py-2 text-right">
          <div className="text-[11px] text-muted-foreground">Până la</div>
          <div className="text-sm font-semibold tabular-nums">{format(hi)}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rating input                                                        */
/* ------------------------------------------------------------------ */

const RATING_LABELS = ["", "Slab", "Așa și așa", "Bine", "Foarte bine", "Excelent"];

/** Tap-to-rate stars with a word that changes as you hover. */
function RatingInput({
  value,
  defaultValue = 0,
  onValueChange,
  className,
}: {
  value?: number;
  defaultValue?: number;
  onValueChange?: (v: number) => void;
  className?: string;
}) {
  const [rating, setRating] = useControllable(value, defaultValue, onValueChange);
  const [hover, setHover] = React.useState(0);
  const shown = hover || rating;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Notă">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} stele`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="rounded-md transition outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <Star className={cn("size-8", n <= shown ? "fill-rating text-rating" : "fill-surface text-surface-strong")} />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-muted-foreground">{RATING_LABELS[shown]}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Field with prefix / suffix                                          */
/* ------------------------------------------------------------------ */

function AffixField({
  start,
  end,
  className,
  inputClassName,
  ...props
}: Omit<React.ComponentProps<"input">, "prefix"> & { start?: React.ReactNode; end?: React.ReactNode; inputClassName?: string }) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2 rounded-lg border border-transparent bg-surface px-3.5 transition focus-within:border-foreground/15 focus-within:bg-background focus-within:ring-3 focus-within:ring-ring/25",
        className,
      )}
    >
      {start && <span className="shrink-0 text-muted-foreground [&_svg]:size-[1.125rem]">{start}</span>}
      <input className={cn("h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground", inputClassName)} {...props} />
      {end && <span className="shrink-0 text-sm font-medium text-muted-foreground">{end}</span>}
    </div>
  );
}

export { AffixField, Checkbox, PriceRange, RadioCards, RatingInput, Segmented, Stepper, Switch, Tabs };
export type { RadioOption };
