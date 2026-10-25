import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { cn } from "@ofry/ui/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Eye, ImageOff, Plus, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { errorMessage, formatNumber, formatPrice, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_auth/my-ads")({
  component: MyAdsPage,
});

const STATUS = {
  active: { label: "Activ", className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  sold: { label: "Vândut", className: "bg-muted text-muted-foreground" },
  inactive: { label: "Dezactivat", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
} as const;

type Tab = "all" | keyof typeof STATUS;

function MyAdsPage() {
  const listings = useQuery(api.listings.mine);
  const setStatus = useMutation(api.listings.setStatus);
  const remove = useMutation(api.listings.remove);
  const [tab, setTab] = useState<Tab>("all");

  const run = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      toast.success(success);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const shown = listings?.filter((l) => tab === "all" || l.status === tab) ?? [];
  const count = (t: Tab) => listings?.filter((l) => t === "all" || l.status === t).length ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Anunțurile mele</h1>
        <Link to="/new" className="btn btn-primary">
          <Plus /> Anunț nou
        </Link>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b">
        {(["all", "active", "sold", "inactive"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap",
              tab === t ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground",
            )}
          >
            {t === "all" ? "Toate" : STATUS[t].label} ({count(t)})
          </button>
        ))}
      </div>

      {listings === undefined ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState icon={<Store />} title="Niciun anunț aici">
          <Link to="/new" className="font-medium text-primary hover:underline">
            Publică primul tău anunț
          </Link>
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {shown.map((l) => {
            const id = l._id as Id<"listings">;
            return (
              <li key={l._id} className="panel flex gap-4 p-3">
                <Link to="/listing/$id" params={{ id }} className="size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {l.imageUrl ? (
                    <img src={l.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageOff className="size-6" />
                    </div>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start gap-2">
                    <Link to="/listing/$id" params={{ id }} className="truncate font-medium hover:underline">
                      {l.title}
                    </Link>
                    <span className={cn("ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", STATUS[l.status].className)}>
                      {STATUS[l.status].label}
                    </span>
                  </div>
                  <div className="font-bold">{formatPrice(l.price)}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{timeAgo(l._creationTime)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" /> {formatNumber(l.views)}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <Link to="/edit/$id" params={{ id }} className="btn btn-outline btn-sm">
                      Editează
                    </Link>
                    {l.status !== "sold" && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => run(() => setStatus({ id, status: "sold" }), "Marcat ca vândut")}>
                        Marchează vândut
                      </button>
                    )}
                    {l.status === "active" ? (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => run(() => setStatus({ id, status: "inactive" }), "Anunț dezactivat")}>
                        Dezactivează
                      </button>
                    ) : (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => run(() => setStatus({ id, status: "active" }), "Anunț reactivat")}>
                        Reactivează
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (confirm("Ștergi definitiv acest anunț?")) run(() => remove({ id }), "Anunț șters");
                      }}
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
