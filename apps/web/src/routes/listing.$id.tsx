import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { cn } from "@ofry/ui/lib/utils";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, Eye, ImageOff, MapPin, Pencil, Phone, Send, Share2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FavoriteButton } from "@/components/favorite-button";
import Loader from "@/components/loader";
import { categoryName, errorMessage, formatNumber, formatPrice, subcategoryName, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/listing/$id")({
  component: ListingPage,
});

function Gallery({ images, title }: { images: { url: string | null }[]; title: string }) {
  const [index, setIndex] = useState(0);
  const urls = images.map((i) => i.url).filter((u): u is string => !!u);
  if (urls.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <ImageOff className="size-10" />
      </div>
    );
  }
  const go = (d: number) => setIndex((i) => (i + d + urls.length) % urls.length);
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
        <img src={urls[index]} alt={title} className="size-full object-contain" />
        {urls.length > 1 && (
          <>
            <button type="button" aria-label="Poza anterioară" onClick={() => go(-1)} className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-black shadow hover:bg-white">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" aria-label="Poza următoare" onClick={() => go(1)} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-black shadow hover:bg-white">
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute right-3 bottom-3 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
              {index + 1} / {urls.length}
            </span>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              className={cn("size-16 shrink-0 overflow-hidden rounded-md border-2", i === index ? "border-primary" : "border-transparent opacity-70")}
            >
              <img src={url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactBox({ listingId, sellerName }: { listingId: Id<"listings">; sellerName: string }) {
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const contact = useMutation(api.messages.contactSeller);
  const [body, setBody] = useState("Bună ziua! Mai este disponibil?");
  const [sending, setSending] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link to="/login" search={{ redirect: location.pathname }} className="btn btn-primary w-full">
        <Send /> Intră în cont ca să trimiți un mesaj
      </Link>
    );
  }

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setSending(true);
        try {
          const conversationId = await contact({ listingId, body });
          toast.success(`Mesaj trimis către ${sellerName}`);
          navigate({ to: "/messages/$conversationId", params: { conversationId } });
        } catch (err) {
          toast.error(errorMessage(err));
        } finally {
          setSending(false);
        }
      }}
    >
      <label htmlFor="message" className="label">
        Trimite un mesaj vânzătorului
      </label>
      <textarea id="message" className="field min-h-24" value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} required />
      <button type="submit" className="btn btn-primary w-full" disabled={sending || !body.trim()}>
        <Send /> Trimite mesaj
      </button>
    </form>
  );
}

function ListingPage() {
  const { id } = Route.useParams();
  const listing = useQuery(api.listings.get, { id });
  const recordView = useMutation(api.listings.recordView);
  const [showPhone, setShowPhone] = useState(false);

  const listingId = listing?._id;
  useEffect(() => {
    if (listingId) recordView({ id: listingId }).catch(() => {});
  }, [listingId, recordView]);

  if (listing === undefined) return <Loader />;
  if (listing === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Anunțul nu mai este disponibil</h1>
        <p className="mt-2 text-muted-foreground">A fost șters sau dezactivat de vânzător.</p>
        <Link to="/search" className="btn btn-primary mt-6">
          Caută alte anunțuri
        </Link>
      </div>
    );
  }

  const specs: [string, string][] = [];
  if (listing.condition) specs.push(["Stare", listing.condition === "new" ? "Nou" : "Folosit"]);
  if (listing.year) specs.push(["An fabricație", String(listing.year)]);
  if (listing.mileage !== undefined) specs.push(["Kilometraj", `${formatNumber(listing.mileage)} km`]);
  if (listing.fuel) specs.push(["Combustibil", listing.fuel]);
  if (listing.gearbox) specs.push(["Cutie de viteze", listing.gearbox]);
  if (listing.rooms) specs.push(["Camere", String(listing.rooms)]);
  if (listing.area) specs.push(["Suprafață utilă", `${listing.area} m²`]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">
          Acasă
        </Link>
        <ChevronRight className="size-3" />
        <Link to="/search" search={{ category: listing.category }} className="hover:underline">
          {categoryName(listing.category)}
        </Link>
        <ChevronRight className="size-3" />
        <Link to="/search" search={{ category: listing.category, subcategory: listing.subcategory }} className="hover:underline">
          {subcategoryName(listing.category, listing.subcategory)}
        </Link>
      </nav>

      {listing.status !== "active" && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          {listing.status === "sold" ? "Acest produs a fost vândut." : "Acest anunț este dezactivat și nu apare în căutări."}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <Gallery images={listing.images} title={listing.title} />

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-4" /> {listing.city}, {listing.county}
              </span>
              <span>Publicat {timeAgo(listing._creationTime)}</span>
              <span className="flex items-center gap-1">
                <Eye className="size-4" /> {formatNumber(listing.views)} vizualizări
              </span>
            </div>
          </div>

          {specs.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map(([k, val]) => (
                <div key={k} className="rounded-lg bg-muted/60 p-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-semibold">{val}</dd>
                </div>
              ))}
            </dl>
          )}

          <section>
            <h2 className="mb-2 text-lg font-semibold">Descriere</h2>
            {listing.description ? (
              <p className="leading-relaxed whitespace-pre-line">{listing.description}</p>
            ) : (
              <p className="text-muted-foreground">Vânzătorul nu a adăugat o descriere.</p>
            )}
          </section>

          <p className="text-xs text-muted-foreground">ID anunț: {listing._id}</p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="panel space-y-4 p-5">
            <div>
              <div className="text-3xl font-black text-price">{formatPrice(listing.price)}</div>
              {listing.negotiable && listing.price > 0 && <div className="text-sm text-muted-foreground">Preț negociabil</div>}
            </div>
            <div className="flex gap-2">
              {listing.isOwner ? (
                <Link to="/edit/$id" params={{ id: listing._id }} className="btn btn-outline flex-1">
                  <Pencil /> Editează
                </Link>
              ) : (
                <FavoriteButton listingId={listing._id} isFavorite={listing.isFavorite} withLabel className="flex-1" />
              )}
              <button
                type="button"
                className="btn btn-outline"
                aria-label="Distribuie"
                onClick={async () => {
                  const url = location.href;
                  if (navigator.share) await navigator.share({ title: listing.title, url }).catch(() => {});
                  else {
                    await navigator.clipboard.writeText(url);
                    toast.success("Link copiat");
                  }
                }}
              >
                <Share2 />
              </button>
            </div>
          </div>

          <div className="panel space-y-4 p-5">
            <Link to="/seller/$id" params={{ id: listing.sellerId }} className="flex items-center gap-3 hover:underline">
              <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-primary">
                <User className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{listing.sellerName}</span>
                <span className="block text-xs text-muted-foreground">
                  {listing.sellerListingCount} {listing.sellerListingCount === 1 ? "anunț activ" : "anunțuri active"}
                </span>
              </span>
            </Link>

            {listing.phone &&
              (listing.phone === "hidden" ? (
                <Link to="/login" search={{ redirect: location.pathname }} className="btn btn-outline w-full">
                  <Phone /> Intră în cont pentru telefon
                </Link>
              ) : showPhone ? (
                <a href={`tel:${listing.phone}`} className="btn btn-outline w-full text-base font-semibold">
                  <Phone /> {listing.phone}
                </a>
              ) : (
                <button type="button" className="btn btn-outline w-full" onClick={() => setShowPhone(true)}>
                  <Phone /> Arată telefonul
                </button>
              ))}

            {!listing.isOwner && listing.status === "active" && (
              <ContactBox listingId={listing._id} sellerName={listing.sellerName} />
            )}
          </div>

          <p className="px-1 text-xs text-muted-foreground">
            Sfat: nu plăti în avans și verifică produsul înainte de a-l cumpăra.
          </p>
        </aside>
      </div>
    </div>
  );
}
