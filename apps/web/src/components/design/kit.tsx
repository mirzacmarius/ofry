import { cn } from "@ofry/ui/lib/utils";
import type { ReactNode } from "react";

/** A titled section of the /design page; `id` feeds the section index. */
export function Block({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-border py-10">
      <div className="mb-6">
        <h2 className="text-heading font-semibold">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Small caption above a specimen. */
export function Specimen({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</div>
      {children}
    </div>
  );
}

/** A phone frame for screen mock-ups. */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative mx-auto flex h-[620px] w-[300px] shrink-0 flex-col overflow-hidden rounded-[2.5rem] border-[10px] border-neutral-950 bg-background shadow-lg", className)}>
      <div className="mx-auto mt-2 h-5 w-24 shrink-0 rounded-full bg-neutral-950" />
      {children}
    </div>
  );
}

/** Soft backdrop that shows a floating surface (dialog, sheet, toast) in context. */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden rounded-3xl bg-linear-to-br from-[var(--ofry-tint-lavender)] to-[var(--ofry-tint-sky)] p-6 dark:from-surface dark:to-surface-strong", className)}>
      {children}
    </div>
  );
}
