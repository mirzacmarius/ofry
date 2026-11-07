import type { ListingCard as Card } from "@ofry/backend/convex/lib/cards";
import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";

import { formatNumber, formatPrice, timeAgo } from "@/lib/format";
import { useFavoriteIds } from "@/lib/use-favorite-ids";

import { FavoriteButton } from "./favorite-button";

function highlights(l: Card) {
  const parts: string[] = [];
  if (l.year) parts.push(String(l.year));
  if (l.mileage !== undefined) parts.push(`${formatNumber(l.mileage)} km`);
  if (l.rooms) parts.push(l.rooms === 1 ? "1 cameră" : `${l.rooms} camere`);
  if (l.area) parts.push(`${l.area} m²`);
  return parts.join(" · ");
}

/**
 * Listing card: photo in a soft grey well, heart in the corner, then title,
 * price and a quiet meta line. No border; the grey well carries the shape.
 */
export function ListingCard({ listing, isFavorite }: { listing: Card; isFavorite?: boolean }) {
  const extra = highlights(listing);
  return (
    <div className="group relative flex flex-col">
      <Link to="/listing/$id" params={{ id: listing._id }} className="flex flex-1 flex-col outline-none">
        <div className="surface relative aspect-square overflow-hidden group-has-[a:focus-visible]:ring-3 group-has-[a:focus-visible]:ring-ring/40">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" strokeWidth={1.5} />
            </div>
          )}
          {listing.status === "sold" ? (
            <span className="badge badge-dark absolute top-2.5 left-2.5">Vândut</span>
          ) : listing.price === 0 ? (
            <span className="badge badge-highlight absolute top-2.5 left-2.5">Gratuit</span>
          ) : (
            listing.previousPrice !== undefined &&
            listing.previousPrice > listing.price && (
              <span className="badge badge-highlight absolute top-2.5 left-2.5">
                −{Math.round(((listing.previousPrice - listing.price) / listing.previousPrice) * 100)}%
              </span>
            )
          )}
        </div>
        <div className="flex flex-1 flex-col pt-2.5 pr-1">
          <h3 className="line-clamp-2 text-[0.9375rem] leading-snug">{listing.title}</h3>
          {extra && <p className="mt-0.5 text-xs text-muted-foreground">{extra}</p>}
          <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-base font-bold text-price sm:text-lg">{formatPrice(listing.price)}</span>
            {listing.previousPrice !== undefined && listing.previousPrice > listing.price && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(listing.previousPrice)}</span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {listing.city} · {timeAgo(listing._creationTime)}
          </p>
        </div>
      </Link>
      {isFavorite !== undefined && (
        <FavoriteButton listingId={listing._id} isFavorite={isFavorite} className="icon-btn absolute top-2.5 right-2.5" />
      )}
    </div>
  );
}

export function ListingGrid({ listings }: { listings: Card[] }) {
  const favoriteIds = useFavoriteIds();
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
      {listings.map((l) => (
        <ListingCard key={l._id} listing={l} isFavorite={favoriteIds.has(l._id)} />
      ))}
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="surface aspect-square animate-pulse" />
          <div className="space-y-2 pt-3">
            <div className="h-4 w-full animate-pulse rounded bg-surface" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-surface" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}
