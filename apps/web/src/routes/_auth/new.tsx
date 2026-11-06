import { api } from "@ofry/backend/convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { ListingForm, emptyListingForm, toListingArgs } from "@/components/listing-form";
import Loader from "@/components/loader";

export const Route = createFileRoute("/_auth/new")({
  component: NewListingPage,
});

function NewListingPage() {
  const create = useMutation(api.listings.create);
  const navigate = useNavigate();
  const me = useQuery(api.account.me);
  if (me === undefined) return <Loader />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Adaugă un anunț</h1>
      <p className="mb-6 text-sm text-muted-foreground">Gratuit. Anunțul apare imediat în căutări.</p>
      <ListingForm
        initial={{ ...emptyListingForm, phone: me?.phone ?? "", county: me?.county ?? "", city: me?.city ?? "" }}
        submitLabel="Publică anunțul"
        onSubmit={async (values) => {
          const id = await create(toListingArgs(values));
          toast.success("Anunțul a fost publicat!");
          navigate({ to: "/listing/$id", params: { id } });
        }}
      />
    </div>
  );
}
