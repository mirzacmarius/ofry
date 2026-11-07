import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { getCategory } from "@ofry/backend/convex/lib/constants";
import { Switch } from "@ofry/ui/components/ofry-forms";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { BellRing, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CategoryIcon, categoryTintName } from "@/components/category-icon";
import { EmptyState } from "@/components/empty-state";
import { errorMessage } from "@/lib/format";
import { filterLabels, pickFilters, searchTitle } from "@/lib/search-labels";

export const Route = createFileRoute("/_auth/saved-searches")({
  component: SavedSearchesPage,
  head: () => ({ meta: [{ title: "Căutări salvate · Ofry.ro" }] }),
});

function SavedSearchesPage() {
  const saved = useQuery(api.savedSearches.list);
  const remove = useMutation(api.savedSearches.remove);
  const setNotify = useMutation(api.savedSearches.setNotify);
  const markSeen = useMutation(api.savedSearches.markSeen);
  const navigate = useNavigate();

  const run = async (fn: () => Promise<unknown>, success?: string) => {
    try {
      await fn();
      if (success) toast.success(success);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const open = (id: Id<"savedSearches">, params: ReturnType<typeof pickFilters>) => {
    markSeen({ id }).catch(() => {});
    navigate({ to: "/search", search: params });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-heading font-semibold">Căutări salvate</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Îți spunem când apar anunțuri noi care se potrivesc. Salvezi o căutare din pagina de rezultate.</p>
      {saved === undefined ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="surface h-36 animate-pulse" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <EmptyState
          icon={<BellRing />}
          title="Nicio căutare salvată"
          action={
            <Link to="/search" className="btn btn-primary">
              <Search /> Caută anunțuri
            </Link>
          }
        >
          Caută ceva, apoi apasă „Salvează căutarea” ca să afli primul de anunțurile noi.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {saved.map((s) => {
            const params = pickFilters(s);
            const category = getCategory(s.category);
            return (
              <li key={s._id} className="panel p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <button type="button" onClick={() => open(s._id, params)} className="flex min-w-0 flex-1 items-start gap-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40 rounded-xl">
                    <span
                      className="tile-tinted flex size-14 shrink-0 items-center justify-center rounded-2xl [&_svg]:size-6"
                      style={{ "--tile-tint": `var(--ofry-tint-${category ? categoryTintName(category.slug) : "lavender"})` } as React.CSSProperties}
                    >
                      {category ? <CategoryIcon icon={category.icon} /> : <Search />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-semibold">{searchTitle(params)}</span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {filterLabels(params)
                          .filter((f) => f.key !== "q")
                          .map((f) => (
                            <span key={f.key} className="chip chip-sm pointer-events-none">
                              {f.label}
                            </span>
                          ))}
                      </span>
                    </span>
                  </button>
                  {s.newCount > 0 && <span className="badge badge-highlight shrink-0">{s.newCount === 1 ? "1 nou" : `${s.newCount} noi`}</span>}
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  <Switch
                    className="flex-1"
                    checked={s.notify}
                    onCheckedChange={(on) => run(() => setNotify({ id: s._id, notify: on }), on ? "Notificări pornite" : "Notificări oprite")}
                    label="Notificări"
                    description="Te anunțăm în Ofry când apar anunțuri noi"
                  />
                  <button type="button" aria-label="Șterge căutarea" className="btn btn-ghost btn-icon text-muted-foreground" onClick={() => run(() => remove({ id: s._id }), "Căutare ștearsă")}>
                    <Trash2 />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
