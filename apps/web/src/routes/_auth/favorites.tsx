import { api } from "@ofry/backend/convex/_generated/api";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Heart } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ListingCard, ListingGridSkeleton } from "@/components/listing-card";

export const Route = createFileRoute("/_auth/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const favorites = useQuery(api.favorites.list);

  return (
    <div className="container-page py-6">
      <h1 className="mb-6 text-heading font-semibold">Favorite</h1>
      {favorites === undefined ? (
        <ListingGridSkeleton count={4} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart />}
          title="Nu ai salvat niciun anunț"
          action={
            <Link to="/search" className="btn btn-primary">
              Caută anunțuri
            </Link>
          }
        >
          Apasă pe inimă la un anunț ca să îl găsești ușor mai târziu.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
          {favorites.map((l) => (
            <ListingCard key={l._id} listing={l} isFavorite />
          ))}
        </div>
      )}
    </div>
  );
}
