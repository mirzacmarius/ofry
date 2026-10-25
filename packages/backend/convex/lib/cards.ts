import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/** The shape returned in result lists: only the first image is resolved. */
export async function toCard(ctx: QueryCtx, listing: Doc<"listings">) {
  const imageUrl = listing.images[0] ? await ctx.storage.getUrl(listing.images[0]) : null;
  return {
    _id: listing._id,
    _creationTime: listing._creationTime,
    title: listing.title,
    price: listing.price,
    negotiable: listing.negotiable,
    category: listing.category,
    subcategory: listing.subcategory,
    county: listing.county,
    city: listing.city,
    status: listing.status,
    views: listing.views,
    year: listing.year,
    mileage: listing.mileage,
    rooms: listing.rooms,
    area: listing.area,
    imageUrl,
  };
}

export type ListingCard = Awaited<ReturnType<typeof toCard>>;
