import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const PAGES = [
  { to: "/help", label: "Ajutor" },
  { to: "/terms", label: "Termeni și condiții" },
  { to: "/privacy", label: "Confidențialitate" },
  { to: "/contact", label: "Contact" },
] as const;

/** Layout for help and legal pages: side menu on desktop, chips on phones. */
export function StaticPage({ title, intro, updated, children }: { title: string; intro?: ReactNode; updated?: string; children: ReactNode }) {
  return (
    <div className="container-page py-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Informații" className="scroll-rail mx-0 gap-2 px-0 lg:flex lg:flex-col lg:gap-1">
          {PAGES.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="chip chip-sm shrink-0 lg:h-auto lg:justify-start lg:rounded-xl lg:bg-transparent lg:px-3 lg:py-2 lg:text-sm lg:hover:bg-surface"
              activeProps={{ className: "chip-active lg:!bg-surface lg:!text-foreground lg:font-semibold" }}
            >
              {p.label}
            </Link>
          ))}
        </nav>
        <article className="max-w-3xl min-w-0">
          <h1 className="text-title font-semibold">{title}</h1>
          {updated && <p className="mt-1 text-sm text-muted-foreground">Ultima actualizare: {updated}</p>}
          {intro && <p className="mt-3 text-lg text-muted-foreground">{intro}</p>}
          <div className="prose-ofry mt-8 space-y-8">{children}</div>
        </article>
      </div>
    </div>
  );
}

export function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="space-y-2 leading-relaxed text-foreground/85 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">{children}</div>
    </section>
  );
}
