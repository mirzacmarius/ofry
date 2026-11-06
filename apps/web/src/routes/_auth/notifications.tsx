import { api } from "@ofry/backend/convex/_generated/api";
import type { Doc } from "@ofry/backend/convex/_generated/dataModel";
import { NotificationItem } from "@ofry/ui/components/ofry-market";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Bell, BellRing, CheckCheck, Clock, HandCoins, Search, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/empty-state";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_auth/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notificări · Ofry.ro" }] }),
});

const LOOK: Record<Doc<"notifications">["kind"], { icon: ReactNode; tone: "brand" | "highlight" | "mint" | "peach" }> = {
  offer: { icon: <HandCoins />, tone: "brand" },
  offer_answer: { icon: <HandCoins />, tone: "brand" },
  price_drop: { icon: <TrendingDown />, tone: "highlight" },
  saved_search: { icon: <Search />, tone: "mint" },
  expiring: { icon: <Clock />, tone: "peach" },
};

function NotificationsPage() {
  const notifications = useQuery(api.notifications.list);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const markSeen = useMutation(api.savedSearches.markSeen);
  const navigate = useNavigate();
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  const open = (n: NonNullable<typeof notifications>[number]) => {
    markRead({ id: n._id }).catch(() => {});
    if (n.conversationId) return navigate({ to: "/messages/$conversationId", params: { conversationId: n.conversationId } });
    if (n.kind === "saved_search" && n.savedSearchId) {
      markSeen({ id: n.savedSearchId }).catch(() => {});
      return navigate({ to: "/saved-searches" });
    }
    if (n.kind === "expiring") return navigate({ to: "/my-ads" });
    if (n.listingId) return navigate({ to: "/listing/$id", params: { id: n.listingId } });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-heading font-semibold">Notificări</h1>
        {unread > 0 && <span className="badge badge-brand">{unread === 1 ? "1 nouă" : `${unread} noi`}</span>}
        {unread > 0 && (
          <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={() => markAllRead().catch(() => {})}>
            <CheckCheck /> Marchează citite
          </button>
        )}
      </div>
      {notifications === undefined ? (
        <div className="panel space-y-2 p-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface h-16 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell />}
          title="Nicio notificare"
          action={
            <Link to="/saved-searches" className="btn btn-primary">
              <BellRing /> Căutări salvate
            </Link>
          }
        >
          Aici apar ofertele primite, reducerile de preț la favorite și anunțurile noi pentru căutările salvate.
        </EmptyState>
      ) : (
        <ul className="panel space-y-1 p-2">
          {notifications.map((n) => (
            <li key={n._id}>
              <button type="button" className="block w-full rounded-2xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40" onClick={() => open(n)}>
                <NotificationItem icon={LOOK[n.kind].icon} tone={LOOK[n.kind].tone} title={n.title} body={n.body} time={timeAgo(n.at)} unread={!n.read} thumb={n.thumb} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
