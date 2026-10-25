import { api } from "@ofry/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Store, User } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";

export const Route = createFileRoute("/seller/$id")({
  component: SellerPage,
});

function SellerPage() {
  const { id } = Route.useParams();
  const data = useQuery(api.listings.bySeller, { sellerId: id });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-primary">
          <User className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{data?.sellerName ?? "Vânzător"}</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.listings.length} anunțuri active` : " "}
          </p>
        </div>
      </div>
      {data === undefined ? (
        <ListingGridSkeleton />
      ) : data.listings.length === 0 ? (
        <EmptyState icon={<Store />} title="Niciun anunț activ" />
      ) : (
        <ListingGrid listings={data.listings} />
      )}
    </div>
  );
}
