import { api } from "@ofry/backend/convex/_generated/api";
import { SafetyTip } from "@ofry/ui/components/ofry-feedback";
import { Rating } from "@ofry/ui/components/ofry";
import { Avatar, SellerCard } from "@ofry/ui/components/ofry-market";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { MapPin, Search, Star, Store } from "lucide-react";
import { useEffect } from "react";

import { EmptyState } from "@/components/empty-state";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { monthYear, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/seller/$id")({
  component: SellerPage,
});

function Reviews({ sellerId }: { sellerId: string }) {
  const data = useQuery(api.reviews.forSeller, { sellerId });
  if (!data || data.reviews === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-heading font-semibold">Recenzii</h2>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="panel h-fit p-5">
          <div className="text-display leading-none font-semibold">{data.rating!.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}</div>
          <Rating value={data.rating!} count={data.reviews} className="mt-2" />
          <ul className="mt-4 space-y-1.5">
            {data.breakdown.map((n, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex w-6 items-center gap-0.5">
                  {5 - i} <Star className="size-3 fill-rating text-rating" />
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong">
                  <span className="block h-full rounded-full bg-rating" style={{ width: `${(n / data.items.length) * 100}%` }} />
                </span>
                <span className="w-5 text-right tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="space-y-3">
          {data.items.map((r) => (
            <li key={r._id} className="panel p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <Avatar name={r.reviewerName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{r.reviewerName}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.listingTitle} · {timeAgo(r._creationTime)}
                  </div>
                </div>
                <span className="flex shrink-0 gap-0.5" aria-label={`${r.rating} din 5 stele`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={n <= r.rating ? "size-4 fill-rating text-rating" : "size-4 fill-surface-strong text-surface-strong"} />
                  ))}
                </span>
              </div>
              {r.text && <p className="mt-3 text-sm whitespace-pre-line text-foreground/85">{r.text}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SellerPage() {
  const { id } = Route.useParams();
  const data = useQuery(api.listings.bySeller, { sellerId: id });
  const name = data?.sellerName;
  useEffect(() => {
    if (!name) return;
    const previous = document.title;
    document.title = `${name}: anunțuri pe Ofry.ro`;
    return () => {
      document.title = previous;
    };
  }, [name]);

  return (
    <div className="container-page py-6">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {data === undefined ? (
            <div className="surface h-52 animate-pulse" />
          ) : (
            <SellerCard
              name={data.sellerName ?? "Vânzător"}
              avatar={data.avatarUrl}
              rating={data.rating}
              reviews={data.reviews || undefined}
              memberSince={data.sellerSince ? monthYear(data.sellerSince) : "—"}
              activeListings={data.listings.length}
              sold={data.soldCount}
            />
          )}
          {data && (data.bio || data.city) && (
            <div className="panel space-y-2 p-5 text-sm">
              {data.city && (
                <p className="flex items-center gap-1.5 font-medium">
                  <MapPin className="size-4 text-muted-foreground" /> {data.city}
                  {data.county ? `, ${data.county}` : ""}
                </p>
              )}
              {data.bio && <p className="whitespace-pre-line text-foreground/80">{data.bio}</p>}
            </div>
          )}
          <SafetyTip tips={["Nu plăti în avans.", "Vezi produsul înainte să plătești.", "Vorbește prin mesajele Ofry."]} className="hidden lg:block" />
        </aside>
        <div className="min-w-0">
          <h1 className="mb-4 text-heading font-semibold">Anunțuri active</h1>
          {data === undefined ? (
            <ListingGridSkeleton />
          ) : data.listings.length === 0 ? (
            <EmptyState
              icon={<Store />}
              title="Niciun anunț activ"
              action={
                <Link to="/search" className="btn btn-primary">
                  <Search /> Caută pe Ofry
                </Link>
              }
            >
              Vânzătorul nu are acum nimic de vânzare.
            </EmptyState>
          ) : (
            <ListingGrid listings={data.listings} />
          )}
          <Reviews sellerId={id} />
        </div>
      </div>
    </div>
  );
}
