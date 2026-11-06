import { api } from "@ofry/backend/convex/_generated/api";
import { SafetyTip } from "@ofry/ui/components/ofry-feedback";
import { SellerCard } from "@ofry/ui/components/ofry-market";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Search, Store } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { monthYear } from "@/lib/format";

export const Route = createFileRoute("/seller/$id")({
  component: SellerPage,
});

function SellerPage() {
  const { id } = Route.useParams();
  const data = useQuery(api.listings.bySeller, { sellerId: id });

  return (
    <div className="container-page py-6">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {data === undefined ? (
            <div className="surface h-52 animate-pulse" />
          ) : (
            <SellerCard
              name={data.sellerName ?? "Vânzător"}
              memberSince={data.sellerSince ? monthYear(data.sellerSince) : "—"}
              activeListings={data.listings.length}
              sold={data.soldCount}
            />
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
        </div>
      </div>
    </div>
  );
}
