import { api } from "@ofry/backend/convex/_generated/api";
import { CATEGORIES, COUNTIES, getCategory } from "@ofry/backend/convex/lib/constants";
import { cn } from "@ofry/ui/lib/utils";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { usePaginatedQuery } from "convex/react";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import z from "zod";

import { CategoryIcon } from "@/components/category-icon";
import { EmptyState } from "@/components/empty-state";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { categoryName, formatPrice, subcategoryName } from "@/lib/format";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  subcategory: z.string().optional().catch(undefined),
  county: z.string().optional().catch(undefined),
  condition: z.enum(["new", "used"]).optional().catch(undefined),
  minPrice: z.number().nonnegative().optional().catch(undefined),
  maxPrice: z.number().nonnegative().optional().catch(undefined),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional().catch(undefined),
});

type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  component: SearchPage,
});

const PAGE_SIZE = 24;

function Filters({ params, update }: { params: SearchParams; update: (p: Partial<SearchParams>) => void }) {
  const category = getCategory(params.category);
  const [minPrice, setMinPrice] = useState(params.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(params.maxPrice?.toString() ?? "");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Categorie</h3>
        <ul className="space-y-0.5 text-sm">
          <li>
            <button
              type="button"
              className={cn("w-full rounded-md px-2 py-1.5 text-left hover:bg-muted", !params.category && "font-semibold text-primary")}
              onClick={() => update({ category: undefined, subcategory: undefined })}
            >
              Toate categoriile
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted",
                  params.category === c.slug && "bg-brand-soft font-semibold text-primary",
                )}
                onClick={() => update({ category: c.slug, subcategory: undefined })}
              >
                <CategoryIcon icon={c.icon} className="size-4 shrink-0" />
                {c.name}
              </button>
              {params.category === c.slug && (
                <ul className="mt-0.5 ml-6 space-y-0.5 border-l pl-2">
                  {c.subcategories.map((s) => (
                    <li key={s.slug}>
                      <button
                        type="button"
                        className={cn(
                          "w-full rounded-md px-2 py-1 text-left text-muted-foreground hover:bg-muted",
                          params.subcategory === s.slug && "font-semibold text-primary",
                        )}
                        onClick={() => update({ subcategory: params.subcategory === s.slug ? undefined : s.slug })}
                      >
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="county">
          Județ
        </label>
        <select
          id="county"
          className="field"
          value={params.county ?? ""}
          onChange={(e) => update({ county: e.target.value || undefined })}
        >
          <option value="">Toată țara</option>
          {COUNTIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const min = minPrice.trim() === "" ? undefined : Number(minPrice);
          const max = maxPrice.trim() === "" ? undefined : Number(maxPrice);
          update({
            minPrice: Number.isFinite(min) ? min : undefined,
            maxPrice: Number.isFinite(max) ? max : undefined,
          });
        }}
      >
        <h3 className="mb-2 text-sm font-semibold">Preț (lei)</h3>
        <div className="flex items-center gap-2">
          <input className="field" inputMode="numeric" placeholder="De la" aria-label="Preț minim" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <span className="text-muted-foreground">–</span>
          <input className="field" inputMode="numeric" placeholder="Până la" aria-label="Preț maxim" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-outline btn-sm mt-2 w-full">
          Aplică prețul
        </button>
      </form>

      {!(category && ["imobiliare", "locuri-de-munca", "servicii", "animale"].includes(category.slug)) && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Stare</h3>
          <div className="flex gap-2">
            {(
              [
                [undefined, "Toate"],
                ["new", "Nou"],
                ["used", "Folosit"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => update({ condition: value })}
                className={cn("btn btn-outline btn-sm flex-1", params.condition === value && "border-primary bg-brand-soft text-primary")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchPage() {
  const params = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState(params.q ?? "");

  const update = (patch: Partial<SearchParams>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const { results, status, loadMore } = usePaginatedQuery(
    api.listings.search,
    {
      q: params.q,
      category: params.category,
      subcategory: params.subcategory,
      county: params.county,
      condition: params.condition,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      sort: params.sort,
    },
    { initialNumItems: PAGE_SIZE },
  );

  const chips: { label: string; clear: Partial<SearchParams> }[] = [];
  if (params.q) chips.push({ label: `„${params.q}”`, clear: { q: undefined } });
  if (params.category) chips.push({ label: categoryName(params.category), clear: { category: undefined, subcategory: undefined } });
  if (params.category && params.subcategory)
    chips.push({ label: subcategoryName(params.category, params.subcategory), clear: { subcategory: undefined } });
  if (params.county) chips.push({ label: params.county, clear: { county: undefined } });
  if (params.minPrice !== undefined) chips.push({ label: `de la ${formatPrice(params.minPrice)}`, clear: { minPrice: undefined } });
  if (params.maxPrice !== undefined) chips.push({ label: `până la ${formatPrice(params.maxPrice)}`, clear: { maxPrice: undefined } });
  if (params.condition) chips.push({ label: params.condition === "new" ? "Nou" : "Folosit", clear: { condition: undefined } });

  const title = params.subcategory && params.category
    ? subcategoryName(params.category, params.subcategory)
    : params.category
      ? categoryName(params.category)
      : params.q
        ? `Rezultate pentru „${params.q}”`
        : "Toate anunțurile";

  // Remount the filter panel when the URL changes so its price inputs stay in sync.
  const filterKey = `${params.minPrice}-${params.maxPrice}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <form
        className="mb-5 flex gap-2"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q.trim() || undefined });
        }}
      >
        <input className="field h-11" placeholder="Ce cauți?" aria-label="Caută" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn btn-primary h-11 px-6">
          Caută
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={cn("lg:block", showFilters ? "block" : "hidden")}>
          <div className="panel p-4 lg:sticky lg:top-20">
            <Filters key={filterKey} params={params} update={update} />
          </div>
        </aside>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="mr-auto text-xl font-bold">{title}</h1>
            <button type="button" className="btn btn-outline btn-sm lg:hidden" onClick={() => setShowFilters((s) => !s)}>
              <SlidersHorizontal /> Filtre
            </button>
            <select
              aria-label="Sortează"
              className="field h-8 w-auto text-xs"
              value={params.sort ?? "newest"}
              disabled={!!params.q}
              title={params.q ? "Rezultatele căutării sunt ordonate după relevanță" : undefined}
              onChange={(e) => update({ sort: e.target.value === "newest" ? undefined : (e.target.value as SearchParams["sort"]) })}
            >
              <option value="newest">Cele mai noi</option>
              <option value="price_asc">Preț crescător</option>
              <option value="price_desc">Preț descrescător</option>
            </select>
          </div>

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => {
                    if ("q" in c.clear) setQ("");
                    update(c.clear);
                  }}
                  className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-primary hover:bg-primary/15"
                >
                  {c.label} <X className="size-3" />
                </button>
              ))}
              <Link to="/search" search={{}} onClick={() => setQ("")} className="text-xs text-muted-foreground hover:underline">
                Șterge filtrele
              </Link>
            </div>
          )}

          {status === "LoadingFirstPage" ? (
            <ListingGridSkeleton />
          ) : results.length === 0 ? (
            <EmptyState icon={<SearchX />} title="Niciun anunț găsit">
              Încearcă alte cuvinte sau scoate câteva filtre.
            </EmptyState>
          ) : (
            <>
              <ListingGrid listings={results} />
              <div className="mt-6 flex justify-center">
                {status === "CanLoadMore" && (
                  <button type="button" className="btn btn-outline" onClick={() => loadMore(PAGE_SIZE)}>
                    Mai multe anunțuri
                  </button>
                )}
                {status === "LoadingMore" && <span className="text-sm text-muted-foreground">Se încarcă...</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
