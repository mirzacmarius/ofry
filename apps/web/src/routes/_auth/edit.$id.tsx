import { api } from "@ofry/backend/convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { ListingForm, emptyListingForm, toListingArgs, type ListingFormValues } from "@/components/listing-form";

export const Route = createFileRoute("/_auth/edit/$id")({
  component: EditListingPage,
});

const str = (n: number | undefined) => (n === undefined ? "" : String(n));

function EditListingPage() {
  const { id } = Route.useParams();
  const listing = useQuery(api.listings.get, { id });
  const update = useMutation(api.listings.update);
  const navigate = useNavigate();

  if (listing === undefined) return <Loader />;
  if (listing === null || !listing.isOwner) {
    return <p className="px-4 py-20 text-center text-muted-foreground">Anunțul nu a fost găsit.</p>;
  }

  const initial: ListingFormValues = {
    ...emptyListingForm,
    title: listing.title,
    description: listing.description,
    price: String(listing.price),
    negotiable: listing.negotiable,
    category: listing.category,
    subcategory: listing.subcategory,
    condition: listing.condition ?? "",
    county: listing.county,
    city: listing.city,
    phone: listing.phone ?? "",
    images: listing.images,
    year: str(listing.year),
    mileage: str(listing.mileage),
    fuel: listing.fuel ?? "",
    gearbox: listing.gearbox ?? "",
    rooms: str(listing.rooms),
    area: str(listing.area),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Editează anunțul</h1>
      <ListingForm
        initial={initial}
        submitLabel="Salvează modificările"
        onSubmit={async (values) => {
          await update({ id: listing._id, ...toListingArgs(values) });
          toast.success("Modificările au fost salvate");
          navigate({ to: "/listing/$id", params: { id: listing._id } });
        }}
      />
    </div>
  );
}
