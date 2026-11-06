import { api } from "@ofry/backend/convex/_generated/api";
import { CATEGORIES, COUNTIES, FUELS, GEARBOXES, getCategory } from "@ofry/backend/convex/lib/constants";
import { SheetCard } from "@ofry/ui/components/ofry-feedback";
import { AffixField, PriceRange, Segmented, Switch } from "@ofry/ui/components/ofry-forms";
import { cn } from "@ofry/ui/lib/utils";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { usePaginatedQuery, useQuery } from "convex/react";
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import z from "zod";

import { CategoryIcon } from "@/components/category-icon";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { SaveSearchButton } from "@/components/save-search-button";
import { categoryName, formatNumber, formatPrice, subcategoryName } from "@/lib/format";
import { rememberSearch } from "@/lib/local-history";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  subcategory: z.string().optional().catch(undefined),
  county: z.string().optional().catch(undefined),
  condition: z.enum(["new", "used"]).optional().catch(undefined),
  minPrice: z.number().nonnegative().optional().catch(undefined),
  maxPrice: z.number().nonnegative().optional().catch(undefined),
  minYear: z.number().int().optional().catch(undefined),
  maxYear: z.number().int().optional().catch(undefined),
  maxMileage: z.number().nonnegative().optional().catch(undefined),
  fuel: z.string().optional().catch(undefined),
  gearbox: z.string().optional().catch(undefined),
  minRooms: z.number().int().positive().optional().catch(undefined),
  minArea: z.number().nonnegative().optional().catch(undefined),
  maxArea: z.number().nonnegative().optional().catch(undefined),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional().catch(undefined),
});

/** Filters that only make sense inside one category, cleared when it changes. */
const CATEGORY_FILTERS = { minYear: undefined, maxYear: undefined, maxMileage: undefined, fuel: undefined, gearbox: undefined, minRooms: undefined, minArea: undefined, maxArea: undefined };

type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  component: SearchPage,
});

const PAGE_SIZE = 24;

type FilterProps = { params: SearchParams; update: (p: Partial<SearchParams>) => void };

const parseNumber = (s: string) => {
  const n = Number(s.replace(/\s|\./g, "").replace(",", "."));
  return s.trim() === "" || !Number.isFinite(n) ? undefined : n;
};

/** Number field that applies on Enter or when it loses focus. */
function NumberFilter({ value, onCommit, ...props }: { value: number | undefined; onCommit: (n: number | undefined) => void } & Omit<React.ComponentProps<typeof AffixField>, "value" | "onChange">) {
  const [text, setText] = useState(value?.toString() ?? "");
  useEffect(() => setText(value?.toString() ?? ""), [value]);
  const commit = () => {
    const n = parseNumber(text);
    if (n !== value) onCommit(n);
  };
  return (
    <AffixField
      inputMode="numeric"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
      {...props}
    />
  );
}

function PriceFilter({ params, update }: FilterProps) {
  const histogram = useQuery(api.listings.priceHistogram, { category: params.category, subcategory: params.subcategory });
  const free = params.maxPrice === 0;
  const max = histogram?.max ?? 0;
  const [range, setRange] = useState<[number, number]>([params.minPrice ?? 0, Math.min(params.maxPrice ?? max, max)]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!free) setRange([Math.min(params.minPrice ?? 0, max), Math.min(params.maxPrice ?? max, max)]);
  }, [params.minPrice, params.maxPrice, max, free]);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">Preț</h3>
      {histogram && !free ? (
        <PriceRange
          min={0}
          max={max}
          step={histogram.step}
          histogram={histogram.buckets}
          value={range}
          format={(n) => (n >= max ? `${formatNumber(max)}+ lei` : `${formatNumber(n)} lei`)}
          onValueChange={(r) => {
            setRange(r);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => update({ minPrice: r[0] > 0 ? r[0] : undefined, maxPrice: r[1] < max ? r[1] : undefined }), 350);
          }}
        />
      ) : (
        !free && (
          <div className="grid grid-cols-2 gap-2">
            <NumberFilter end="lei" placeholder="De la" aria-label="Preț minim" value={params.minPrice} onCommit={(n) => update({ minPrice: n })} />
            <NumberFilter end="lei" placeholder="Până la" aria-label="Preț maxim" value={params.maxPrice} onCommit={(n) => update({ maxPrice: n })} />
          </div>
        )
      )}
      <Switch
        className="mt-4"
        label="Doar gratuite"
        description="Lucruri pe care oamenii le dau"
        checked={free}
        onCheckedChange={(on) => update({ minPrice: undefined, maxPrice: on ? 0 : undefined })}
      />
    </div>
  );
}

function CategoryFilters({ params, update }: FilterProps) {
  const attrs = getCategory(params.category)?.attributes ?? [];
  if (attrs.length === 0) return null;
  return (
    <div className="space-y-4">
      {attrs.includes("year") && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">An fabricație</h3>
          <div className="grid grid-cols-2 gap-2">
            <NumberFilter placeholder="De la" aria-label="An minim" value={params.minYear} onCommit={(n) => update({ minYear: n })} />
            <NumberFilter placeholder="Până la" aria-label="An maxim" value={params.maxYear} onCommit={(n) => update({ maxYear: n })} />
          </div>
        </div>
      )}
      {attrs.includes("mileage") && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Kilometraj maxim</h3>
          <NumberFilter end="km" placeholder="ex. 150 000" aria-label="Kilometraj maxim" value={params.maxMileage} onCommit={(n) => update({ maxMileage: n })} />
        </div>
      )}
      {attrs.includes("fuel") && (
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="fuel">
            Combustibil
          </label>
          <select id="fuel" className="field" value={params.fuel ?? ""} onChange={(e) => update({ fuel: e.target.value || undefined })}>
            <option value="">Oricare</option>
            {FUELS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      )}
      {attrs.includes("gearbox") && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Cutie de viteze</h3>
          <Segmented<string>
            options={[{ value: "", label: "Oricare" }, ...GEARBOXES.map((g) => ({ value: g, label: g }))]}
            value={params.gearbox ?? ""}
            onValueChange={(g) => update({ gearbox: g || undefined })}
            size="sm"
            className="w-full"
          />
        </div>
      )}
      {attrs.includes("rooms") && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Camere</h3>
          <Segmented<string>
            options={[{ value: "", label: "Oricâte" }, ...[1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n}+` }))]}
            value={params.minRooms ? String(params.minRooms) : ""}
            onValueChange={(r) => update({ minRooms: r ? Number(r) : undefined })}
            size="sm"
            className="w-full"
          />
        </div>
      )}
      {attrs.includes("area") && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Suprafață utilă</h3>
          <div className="grid grid-cols-2 gap-2">
            <NumberFilter end="m²" placeholder="De la" aria-label="Suprafață minimă" value={params.minArea} onCommit={(n) => update({ minArea: n })} />
            <NumberFilter end="m²" placeholder="Până la" aria-label="Suprafață maximă" value={params.maxArea} onCommit={(n) => update({ maxArea: n })} />
          </div>
        </div>
      )}
    </div>
  );
}

function Filters({ params, update }: FilterProps) {
  const category = getCategory(params.category);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Categorie</h3>
        <ul className="space-y-0.5 text-sm">
          <li>
            <button
              type="button"
              className={cn("w-full rounded-md px-2.5 py-2 text-left hover:bg-surface", !params.category && "bg-surface font-semibold")}
              onClick={() => update({ category: undefined, subcategory: undefined, ...CATEGORY_FILTERS })}
            >
              Toate categoriile
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-surface",
                  params.category === c.slug && "bg-surface font-semibold",
                )}
                onClick={() => update({ category: c.slug, subcategory: undefined, ...(params.category === c.slug ? {} : CATEGORY_FILTERS) })}
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
                          "w-full rounded-md px-2.5 py-1.5 text-left text-muted-foreground hover:bg-surface hover:text-foreground",
                          params.subcategory === s.slug && "font-semibold text-foreground",
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

      <PriceFilter params={params} update={update} />

      <CategoryFilters params={params} update={update} />

      {!(category && ["imobiliare", "locuri-de-munca", "servicii", "animale"].includes(category.slug)) && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Stare</h3>
          <Segmented<"all" | "new" | "used">
            options={[
              { value: "all", label: "Toate" },
              { value: "new", label: "Nou" },
              { value: "used", label: "Folosit" },
            ]}
            value={params.condition ?? "all"}
            onValueChange={(c) => update({ condition: c === "all" ? undefined : c })}
            size="sm"
            className="w-full"
          />
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
      minYear: params.minYear,
      maxYear: params.maxYear,
      maxMileage: params.maxMileage,
      fuel: params.fuel,
      gearbox: params.gearbox,
      minRooms: params.minRooms,
      minArea: params.minArea,
      maxArea: params.maxArea,
      sort: params.sort,
    },
    { initialNumItems: PAGE_SIZE },
  );
  const { sort: _sort, ...countArgs } = params;
  const total = useQuery(api.listings.searchCount, showFilters ? countArgs : "skip");

  const chips: { label: string; clear: Partial<SearchParams> }[] = [];
  if (params.q) chips.push({ label: `„${params.q}”`, clear: { q: undefined } });
  if (params.category) chips.push({ label: categoryName(params.category), clear: { category: undefined, subcategory: undefined, ...CATEGORY_FILTERS } });
  if (params.category && params.subcategory)
    chips.push({ label: subcategoryName(params.category, params.subcategory), clear: { subcategory: undefined } });
  if (params.county) chips.push({ label: params.county, clear: { county: undefined } });
  if (params.minPrice !== undefined) chips.push({ label: `de la ${formatPrice(params.minPrice)}`, clear: { minPrice: undefined } });
  if (params.maxPrice !== undefined) chips.push({ label: params.maxPrice === 0 ? "Gratuite" : `până la ${formatPrice(params.maxPrice)}`, clear: { maxPrice: undefined } });
  if (params.condition) chips.push({ label: params.condition === "new" ? "Nou" : "Folosit", clear: { condition: undefined } });
  if (params.minYear !== undefined) chips.push({ label: `din ${params.minYear}`, clear: { minYear: undefined } });
  if (params.maxYear !== undefined) chips.push({ label: `până în ${params.maxYear}`, clear: { maxYear: undefined } });
  if (params.maxMileage !== undefined) chips.push({ label: `max. ${formatNumber(params.maxMileage)} km`, clear: { maxMileage: undefined } });
  if (params.fuel) chips.push({ label: params.fuel, clear: { fuel: undefined } });
  if (params.gearbox) chips.push({ label: `Cutie ${params.gearbox.toLowerCase()}`, clear: { gearbox: undefined } });
  if (params.minRooms) chips.push({ label: `${params.minRooms}+ camere`, clear: { minRooms: undefined } });
  if (params.minArea !== undefined) chips.push({ label: `de la ${params.minArea} m²`, clear: { minArea: undefined } });
  if (params.maxArea !== undefined) chips.push({ label: `până la ${params.maxArea} m²`, clear: { maxArea: undefined } });

  const title = params.subcategory && params.category
    ? subcategoryName(params.category, params.subcategory)
    : params.category
      ? categoryName(params.category)
      : params.q
        ? `Rezultate pentru „${params.q}”`
        : "Toate anunțurile";


  return (
    <div className="container-page py-4 sm:py-6">
      <form
        className="mb-5 flex gap-2"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          rememberSearch(q);
          update({ q: q.trim() || undefined });
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[1.125rem] -translate-y-1/2 text-muted-foreground" />
          <input className="field pl-10" placeholder="Ce cauți?" aria-label="Caută" enterKeyHint="search" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary px-6">
          Caută
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="panel p-5 lg:sticky lg:top-20">
            <Filters params={params} update={update} />
          </div>
        </aside>
        <Modal open={showFilters} onClose={() => setShowFilters(false)} className="lg:hidden">
          <SheetCard
            className="max-h-[92dvh] overflow-y-auto pb-0 [&>div:last-child]:sticky [&>div:last-child]:bottom-0 [&>div:last-child]:-mx-5 [&>div:last-child]:border-t [&>div:last-child]:border-border [&>div:last-child]:bg-card [&>div:last-child]:px-5 [&>div:last-child]:pt-3 [&>div:last-child]:pb-[max(1rem,env(safe-area-inset-bottom))]"
            title={
              <span className="flex items-center justify-between">
                Filtre
                <Link
                  to="/search"
                  search={{ q: params.q }}
                  data-modal-skip
                  className="text-sm font-semibold text-brand-ink"
                  onClick={() => setShowFilters(false)}
                >
                  Resetează
                </Link>
              </span>
            }
            footer={
              <button type="button" data-modal-skip className="btn btn-primary btn-lg w-full" onClick={() => setShowFilters(false)}>
                <SlidersHorizontal />
                {total === undefined
                  ? "Arată anunțurile"
                  : total.count === 0
                    ? "Niciun anunț"
                    : `Arată ${formatNumber(total.count)}${total.capped ? "+" : ""} ${total.count === 1 ? "anunț" : "anunțuri"}`}
              </button>
            }
          >
            <Filters params={params} update={update} />
          </SheetCard>
        </Modal>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="mr-auto text-heading font-semibold">{title}</h1>
            <SaveSearchButton params={params} />
            <button type="button" className="chip chip-sm lg:hidden" onClick={() => setShowFilters(true)}>
              <SlidersHorizontal /> Filtre{chips.length > 0 ? ` · ${chips.length}` : ""}
            </button>
            <select
              aria-label="Sortează"
              className="field h-8 w-auto rounded-full pl-3 text-xs"
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
                  className="chip chip-sm chip-active"
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
            <EmptyState
              icon={<SearchX />}
              title="Niciun anunț găsit"
              action={
                chips.length > 0 ? (
                  <Link to="/search" search={{}} onClick={() => setQ("")} className="btn btn-primary">
                    Șterge filtrele
                  </Link>
                ) : undefined
              }
            >
              Încearcă alte cuvinte sau scoate câteva filtre.
            </EmptyState>
          ) : (
            <>
              <ListingGrid listings={results} />
              <div className="mt-6 flex justify-center">
                {status === "CanLoadMore" && (
                  <button type="button" className="btn btn-secondary" onClick={() => loadMore(PAGE_SIZE)}>
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
