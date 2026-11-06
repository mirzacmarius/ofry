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
  active: { label: "Activ", className: "badge-brand" },
  sold: { label: "Vândut", className: "badge-dark" },
  inactive: { label: "Dezactivat", className: "" },
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
        <Link to="/new" className="btn btn-accent">
          <Plus /> Anunț nou
        </Link>
      </div>

      <div className="scroll-rail mb-5 gap-2">
        {(["all", "active", "sold", "inactive"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className="chip"
          >
            {t === "all" ? "Toate" : STATUS[t].label} ({count(t)})
          </button>
        ))}
      </div>

      {listings === undefined ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface h-28 animate-pulse" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState icon={<Store />} title="Niciun anunț aici">
          <Link to="/new" className="font-medium underline underline-offset-4">
            Publică primul tău anunț
          </Link>
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {shown.map((l) => {
            const id = l._id as Id<"listings">;
            return (
              <li key={l._id} className="panel flex gap-4 p-3">
                <Link to="/listing/$id" params={{ id }} className="surface size-24 shrink-0 overflow-hidden rounded-xl">
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
                    <span className={cn("badge ml-auto shrink-0", STATUS[l.status].className)}>
                      {STATUS[l.status].label}
                    </span>
                  </div>
                  <div className="font-bold text-price">{formatPrice(l.price)}</div>
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
