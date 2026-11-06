import { cn } from "@ofry/ui/lib/utils";
import { AlertTriangle, CheckCircle2, Info, ShieldCheck, X, XCircle } from "lucide-react";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Alert                                                               */
/* ------------------------------------------------------------------ */

const ALERT = {
  info: { icon: Info, box: "bg-brand-soft", iconBox: "bg-primary text-primary-foreground" },
  success: { icon: CheckCircle2, box: "bg-[var(--ofry-tint-mint)] dark:bg-emerald-950/50", iconBox: "bg-emerald-600 text-white" },
  warning: { icon: AlertTriangle, box: "bg-[var(--ofry-tint-butter)] dark:bg-amber-950/50", iconBox: "bg-highlight text-highlight-foreground" },
  danger: { icon: XCircle, box: "bg-destructive/10", iconBox: "bg-destructive text-white" },
} as const;

/** Inline message with a round icon; tone sets the tint. */
function Alert({
  tone = "info",
  title,
  children,
  action,
  onDismiss,
  className,
}: {
  tone?: keyof typeof ALERT;
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}) {
  const t = ALERT[tone];
  const Icon = t.icon;
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl p-4", t.box, className)}>
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", t.iconBox)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <div className="text-sm font-semibold">{title}</div>
        {children && <div className="mt-0.5 text-sm text-foreground/75">{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" aria-label="Închide" onClick={onDismiss} className="-m-1 h-fit rounded-full p-1 text-foreground/60 hover:bg-background/60">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Safety tip                                                          */
/* ------------------------------------------------------------------ */

/** Navy card with a shield, for the "don't pay in advance" kind of advice. */
function SafetyTip({ title = "Cumpără în siguranță", tips, className }: { title?: string; tips: string[]; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-ink p-5 text-ink-foreground", className)}>
      <ShieldCheck aria-hidden className="absolute -right-4 -bottom-6 size-32 text-ink-foreground/[0.06]" strokeWidth={1.25} />
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
          <ShieldCheck className="size-4" />
        </span>
        <span className="font-semibold">{title}</span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-ink-foreground/80">
        {tips.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-highlight" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toast (presentational)                                              */
/* ------------------------------------------------------------------ */

/** The look of a toast; the live ones come from sonner and share these colours. */
function ToastCard({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink p-3 pr-4 text-ink-foreground shadow-lg", className)}>
      {icon && <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-foreground/10 [&_svg]:size-5">{icon}</span>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{title}</div>
        {description && <div className="truncate text-xs text-ink-foreground/70">{description}</div>}
      </div>
      {action && <div className="shrink-0 text-sm font-semibold text-highlight">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog and bottom sheet (static surfaces)                           */
/* ------------------------------------------------------------------ */

/** Centered dialog surface: icon bubble, title, text, stacked actions. */
function DialogCard({
  icon,
  tone = "brand",
  title,
  children,
  actions,
  className,
}: {
  icon?: React.ReactNode;
  tone?: "brand" | "danger";
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="dialog" aria-modal="true" className={cn("w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-lg ring-1 ring-border", className)}>
      {icon && (
        <span
          className={cn(
            "mx-auto flex size-14 items-center justify-center rounded-full [&_svg]:size-6",
            tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-brand-soft text-brand-ink",
          )}
        >
          {icon}
        </span>
      )}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {children && <div className="mt-1.5 text-sm text-muted-foreground">{children}</div>}
      {actions && <div className="mt-6 grid gap-2">{actions}</div>}
    </div>
  );
}

/** Phone bottom sheet surface with a grab handle. */
function SheetCard({ title, children, footer, className }: { title?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full rounded-t-3xl bg-card px-5 pt-2.5 pb-5 shadow-lg ring-1 ring-border", className)}>
      <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-surface-strong" />
      {title && <div className="mb-4 text-lg font-semibold">{title}</div>}
      {children}
      {footer && <div className="mt-5">{footer}</div>}
    </div>
  );
}

/** Small dark bubble with an arrow, for hints over icons. */
function TooltipBubble({ children, side = "top", className }: { children: React.ReactNode; side?: "top" | "bottom"; className?: string }) {
  return (
    <span className={cn("relative inline-block rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-ink-foreground shadow-md", className)}>
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute left-1/2 size-2 -translate-x-1/2 rotate-45 bg-ink",
          side === "top" ? "-bottom-1" : "-top-1",
        )}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

function ProgressBar({ value, label, hint, className }: { value: number; label?: React.ReactNode; hint?: React.ReactNode; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {(label || hint) && (
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground">{hint ?? `${Math.round(v)}%`}</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-strong" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-linear-to-r from-promo to-promo-to transition-all" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/** Circular progress with the value in the middle (profile completeness). */
function ProgressRing({ value, size = 88, stroke = 8, children, className }: { value: number; size?: number; stroke?: number; children?: React.ReactNode; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-strong" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          className="stroke-primary transition-all"
        />
      </svg>
      <span className="absolute text-center">{children ?? <span className="text-lg font-bold">{Math.round(v)}%</span>}</span>
    </div>
  );
}

/** Three bouncing dots, for "se scrie" and inline loading. */
function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label="Se scrie">
      {[0, 150, 300].map((d) => (
        <span key={d} className="size-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state art                                                     */
/* ------------------------------------------------------------------ */

/** Pastel blob with floating shapes and an icon in the middle. */
function EmptyArt({ icon, className }: { icon: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative mx-auto size-36", className)} aria-hidden>
      <svg viewBox="0 0 160 160" className="absolute inset-0 size-full">
        <path
          d="M80 10c30 0 62 16 68 46s-6 66-36 82-74 10-92-18S2 48 24 28 50 10 80 10Z"
          fill="var(--ofry-tint-lavender)"
          className="dark:opacity-25"
        />
        <circle cx="132" cy="30" r="9" fill="var(--highlight)" />
        <circle cx="22" cy="118" r="6" fill="var(--ofry-tint-mint)" />
        <rect x="118" y="112" width="16" height="16" rx="5" fill="var(--ofry-tint-peach)" transform="rotate(18 126 120)" />
      </svg>
      <span className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md [&_svg]:size-7">
        {icon}
      </span>
    </div>
  );
}

export { Alert, DialogCard, EmptyArt, ProgressBar, ProgressRing, SafetyTip, SheetCard, ToastCard, TooltipBubble, TypingDots };
