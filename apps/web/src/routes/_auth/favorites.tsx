import { api } from "@ofry/backend/convex/_generated/api";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Heart } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { FavoriteButton } from "@/components/favorite-button";
import { ListingCard, ListingGridSkeleton } from "@/components/listing-card";

export const Route = createFileRoute("/_auth/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const favorites = useQuery(api.favorites.list);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Favorite</h1>
      {favorites === undefined ? (
        <ListingGridSkeleton count={4} />
      ) : favorites.length === 0 ? (
        <EmptyState icon={<Heart />} title="Nu ai salvat niciun anunț">
          Apasă pe inimă la un anunț ca să îl găsești ușor mai târziu.{" "}
          <Link to="/search" className="font-medium text-primary hover:underline">
            Caută anunțuri
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {favorites.map((l) => (
            <div key={l._id} className="relative">
              <ListingCard listing={l} />
              <FavoriteButton
                listingId={l._id}
                isFavorite
                className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
