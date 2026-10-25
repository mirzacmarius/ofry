import type { ListingCard as Card } from "@ofry/backend/convex/lib/cards";
import { Link } from "@tanstack/react-router";
import { ImageOff, MapPin } from "lucide-react";

import { formatNumber, formatPrice, timeAgo } from "@/lib/format";

function highlights(l: Card) {
  const parts: string[] = [];
  if (l.year) parts.push(String(l.year));
  if (l.mileage !== undefined) parts.push(`${formatNumber(l.mileage)} km`);
  if (l.rooms) parts.push(l.rooms === 1 ? "1 cameră" : `${l.rooms} camere`);
  if (l.area) parts.push(`${l.area} m²`);
  return parts.join(" · ");
}

export function ListingCard({ listing }: { listing: Card }) {
  const extra = highlights(listing);
  return (
    <Link
      to="/listing/$id"
      params={{ id: listing._id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        {listing.status === "sold" && (
          <span className="absolute top-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-xs font-semibold text-white">
            VÂNDUT
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          <span className="truncate">
            {listing.city}, {listing.county}
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-medium group-hover:underline">{listing.title}</h3>
        {extra && <p className="text-xs text-muted-foreground">{extra}</p>}
        <div className="mt-auto flex items-end justify-between pt-1">
          <span className="text-base font-bold text-price">{formatPrice(listing.price)}</span>
          <span className="text-[11px] text-muted-foreground">{timeAgo(listing._creationTime)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ListingGrid({ listings }: { listings: Card[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((l) => (
        <ListingCard key={l._id} listing={l} />
      ))}
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border">
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
