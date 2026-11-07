import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { Alert } from "@ofry/ui/components/ofry-feedback";
import { Tabs } from "@ofry/ui/components/ofry-forms";
import { DAY_MS, RENEW_WINDOW_DAYS } from "@ofry/backend/convex/lib/constants";
import { Countdown, ListingRow, StatTile } from "@ofry/ui/components/ofry-market";
import { cn } from "@ofry/ui/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Eye, Heart, MessageCircle, Plus, RefreshCw, Store, Tag, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { errorMessage, formatNumber, timeAgo } from "@/lib/format";

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
  const conversations = useQuery(api.messages.conversations);
  const stats = useQuery(api.account.stats);
  const setStatus = useMutation(api.listings.setStatus);
  const renew = useMutation(api.listings.renew);
  const remove = useMutation(api.listings.remove);
  const [tab, setTab] = useState<Tab>("all");
  const [deleting, setDeleting] = useState<{ id: Id<"listings">; title: string }>();

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
  const now = Date.now();
  const buyers = conversations?.filter((c) => c.role === "seller") ?? [];
  const waiting = buyers.filter((c) => c.unread).length;
  const freshest = listings?.filter((l) => l.status === "active").sort((a, b) => b.views - a.views)[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-heading font-semibold">Anunțurile mele</h1>
        <Link to="/new" className="btn btn-accent">
          <Plus /> Anunț nou
        </Link>
      </div>

      {listings && listings.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={<Eye />} label="Vizualizări" value={formatNumber(stats?.views.total ?? 0)} delta={stats?.views.delta} data={stats?.views.data} />
          <StatTile icon={<Heart />} label="Salvări" value={formatNumber(stats?.saves.total ?? 0)} delta={stats?.saves.delta} data={stats?.saves.data} />
          <StatTile icon={<MessageCircle />} label="Cumpărători" value={formatNumber(stats?.buyers.total ?? buyers.length)} delta={stats?.buyers.delta} data={stats?.buyers.data} />
          <StatTile icon={<Tag />} label="Vândute" value={formatNumber(count("sold"))} />
        </div>
      )}

      {waiting > 0 ? (
        <Alert
          className="mb-6"
          title={waiting === 1 ? "Un cumpărător așteaptă răspunsul tău" : `${waiting} cumpărători așteaptă răspunsul tău`}
          action={
            <Link to="/messages" className="btn btn-primary btn-sm">
              <MessageCircle /> Vezi mesajele
            </Link>
          }
        >
          Cine răspunde în prima oră vinde de obicei mai repede.
        </Alert>
      ) : freshest && freshest.views > 0 ? (
        <Alert tone="success" className="mb-6" title={`„${freshest.title}” e cel mai văzut anunț al tău`}>
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="size-4" /> {formatNumber(freshest.views)} vizualizări până acum.
          </span>
        </Alert>
      ) : null}

      <Tabs<Tab>
        className="mb-5"
        value={tab}
        onValueChange={setTab}
        tabs={(["all", "active", "sold", "inactive"] as const).map((t) => ({
          value: t,
          label: t === "all" ? "Toate" : STATUS[t].label,
          count: count(t),
        }))}
      />

      {listings === undefined ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface h-28 animate-pulse" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={<Store />}
          title={tab === "all" ? "Încă nu ai anunțuri" : "Niciun anunț aici"}
          action={
            <Link to="/new" className="btn btn-primary">
              <Plus /> Publică un anunț
            </Link>
          }
        >
          Publici în 2 minute, gratuit. Poze bune și un preț corect fac minuni.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {shown.map((l) => {
            const id = l._id as Id<"listings">;
            return (
              <li key={l._id} className="panel p-3 sm:p-4">
                <Link to="/listing/$id" params={{ id }} className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                  <ListingRow
                    image={l.imageUrl}
                    title={l.title}
                    price={l.price}
                    badges={
                      <>
                        <span className={cn("badge", STATUS[l.status].className)}>{l.expiredAt ? "Expirat" : STATUS[l.status].label}</span>
                        {l.status === "active" && l.expiresAt !== undefined && <Countdown hoursLeft={Math.max(0, (l.expiresAt - now) / 3_600_000)} />}
                      </>
                    }
                    meta={
                      <span className="inline-flex items-center gap-3">
                        <span>{timeAgo(l._creationTime)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3" /> {formatNumber(l.views)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="size-3" /> {formatNumber(l.favoriteCount)}
                        </span>
                      </span>
                    }
                  />
                </Link>
                <div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                    {l.status !== "sold" &&
                      (l.expiredAt !== undefined || (l.expiresAt !== undefined && l.expiresAt - now <= RENEW_WINDOW_DAYS * DAY_MS)) && (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => run(() => renew({ id }), "Anunț reînnoit pentru încă 30 de zile")}>
                          <RefreshCw /> Reînnoiește gratuit
                        </button>
                      )}
                    <Link to="/edit/$id" params={{ id }} className="btn btn-outline btn-sm">
                      Editează
                    </Link>
                    {l.status !== "sold" && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => run(() => setStatus({ id, status: "sold" }), "Marcat ca vândut")}>
                        Marchează vândut
                      </button>
                    )}
                    {l.expiredAt !== undefined ? null : l.status === "active" ? (
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
                      onClick={() => setDeleting({ id, title: l.title })}
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

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(undefined)}
        onConfirm={() => deleting && run(() => remove({ id: deleting.id }), "Anunț șters")}
        icon={<Trash2 />}
        title="Ștergi anunțul?"
        confirmLabel="Șterge definitiv"
        danger
      >
        „{deleting?.title}” dispare împreună cu pozele. Dacă doar l-ai vândut, mai bine îl marchezi ca vândut.
      </ConfirmDialog>
    </div>
  );
}
