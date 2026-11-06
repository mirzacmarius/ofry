import type { Category } from "@ofry/backend/convex/lib/constants";
import { cn } from "@ofry/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import { formatNumber } from "@/lib/format";

import { CategoryIcon, categoryShortName } from "./category-icon";

/**
 * Grey tile with the label top-left and a large icon bottom-right.
 * Used in category grids (home on desktop, category pages).
 */
export function CategoryTile({ category, count, className }: { category: Category; count?: number; className?: string }) {
  return (
    <Link
      to="/search"
      search={{ category: category.slug }}
      className={cn(
        "surface group relative flex aspect-[4/3] flex-col overflow-hidden p-4 transition hover:bg-surface-strong",
        className,
      )}
    >
      <span className="text-sm leading-snug font-medium">{category.name}</span>
      {count !== undefined && (
        <span className="mt-0.5 text-xs text-muted-foreground">{formatNumber(count)} anunțuri</span>
      )}
      <span className="absolute -right-3 -bottom-3 flex size-24 items-center justify-center rounded-full bg-background/70 transition group-hover:scale-105">
        <CategoryIcon icon={category.icon} strokeWidth={1.5} className="size-11 -translate-x-1 -translate-y-1" />
      </span>
    </Link>
  );
}

/** Square photo-style tile with the label underneath. Used in the horizontal rail on phones. */
export function CategoryRailItem({ category }: { category: Category }) {
  return (
    <Link
      to="/search"
      search={{ category: category.slug }}
      className="group flex w-[5.5rem] shrink-0 flex-col items-center gap-2"
    >
      <span className="surface flex aspect-square w-full items-center justify-center transition group-hover:bg-surface-strong">
        <CategoryIcon icon={category.icon} strokeWidth={1.5} className="size-9" />
      </span>
      <span className="text-center text-[0.8125rem] leading-tight font-medium">
        {categoryShortName(category.slug, category.name)}
      </span>
    </Link>
  );
}
