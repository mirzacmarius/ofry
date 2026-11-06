import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { ImageDots } from "@ofry/ui/components/ofry";
import { cn } from "@ofry/ui/lib/utils";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, ImageOff, MapPin, Pencil, Phone, Send, Share, ShieldCheck, User } from "lucide-react";
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
      <div className="surface flex aspect-[4/3] items-center justify-center rounded-3xl text-muted-foreground">
        <ImageOff className="size-10" strokeWidth={1.5} />
      </div>
    );
  }
  const go = (d: number) => setIndex((i) => (i + d + urls.length) % urls.length);
  return (
    <div>
      <div className="surface relative aspect-square overflow-hidden rounded-3xl sm:aspect-[4/3]">
        <img src={urls[index]} alt={title} className="size-full object-contain" />
        {urls.length > 1 && (
          <>
            <button type="button" aria-label="Poza anterioară" onClick={() => go(-1)} className="icon-btn absolute top-1/2 left-3 -translate-y-1/2">
              <ChevronLeft />
            </button>
            <button type="button" aria-label="Poza următoare" onClick={() => go(1)} className="icon-btn absolute top-1/2 right-3 -translate-y-1/2">
              <ChevronRight />
            </button>
            <span className="badge absolute right-3 bottom-3 bg-background/90">
              {index + 1} / {urls.length}
            </span>
          </>
        )}
      </div>
      <ImageDots count={urls.length} active={index} className="mt-3 sm:hidden" />
      {urls.length > 1 && (
        <div className="mt-3 hidden gap-2 overflow-x-auto pb-1 sm:flex">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              aria-label={`Poza ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "surface size-16 shrink-0 overflow-hidden rounded-xl ring-2 transition",
                i === index ? "ring-foreground" : "opacity-70 ring-transparent hover:opacity-100",
              )}
            >
              <img src={url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PhoneButton({
  phone,
  revealed,
  onReveal,
  className,
}: {
  phone: string;
  revealed: boolean;
  onReveal: () => void;
  className?: string;
}) {
  if (phone === "hidden") {
    return (
      <Link to="/login" search={{ redirect: location.pathname }} className={cn("btn btn-brand-outline", className)}>
        <Phone /> Telefon
      </Link>
    );
  }
  if (revealed) {
    return (
      <a href={`tel:${phone}`} className={cn("btn btn-brand-outline", className)}>
        <Phone /> {phone}
      </a>
    );
  }
  return (
    <button type="button" className={cn("btn btn-brand-outline", className)} onClick={onReveal}>
      <Phone /> Arată telefonul
    </button>
  );
}

async function share(title: string) {
  const url = location.href;
  if (navigator.share) await navigator.share({ title, url }).catch(() => {});
  else {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiat");
  }
}

function ContactBox({ listingId, sellerName }: { listingId: Id<"listings">; sellerName: string }) {
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const contact = useMutation(api.messages.contactSeller);
  const [body, setBody] = useState("Bună ziua! Mai este disponibil?");
  const [sending, setSending] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link id="contact" to="/login" search={{ redirect: location.pathname }} className="btn btn-primary w-full scroll-mt-24">
        <Send /> Intră în cont ca să trimiți un mesaj
      </Link>
    );
  }

  return (
    <form
      id="contact"
      className="scroll-mt-24 space-y-2"
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
      <textarea id="message" className="field min-h-28" value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} required />
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

  const canContact = !listing.isOwner && listing.status === "active";

  return (
    <div className="container-page pt-2 pb-28 sm:pt-6 lg:pb-6">
      <div className="mb-3 flex items-center gap-2 lg:hidden">
        <button type="button" aria-label="Înapoi" onClick={() => history.back()} className="btn btn-ghost btn-icon -ml-2">
          <ArrowLeft className="!size-6" />
        </button>
        <div className="ml-auto flex items-center">
          {!listing.isOwner && (
            <FavoriteButton listingId={listing._id} isFavorite={listing.isFavorite} className="btn btn-ghost btn-icon [&_svg]:!size-6" />
          )}
          <button type="button" aria-label="Distribuie" onClick={() => share(listing.title)} className="btn btn-ghost btn-icon -mr-2">
            <Share className="!size-6" />
          </button>
        </div>
      </div>

      <nav className="mb-5 hidden flex-wrap items-center gap-1 text-sm text-muted-foreground lg:flex">
        <Link to="/" className="hover:text-foreground">
          Acasă
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to="/search" search={{ category: listing.category }} className="hover:text-foreground">
          {categoryName(listing.category)}
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to="/search" search={{ category: listing.category, subcategory: listing.subcategory }} className="hover:text-foreground">
          {subcategoryName(listing.category, listing.subcategory)}
        </Link>
      </nav>

      {listing.status !== "active" && (
        <div className="surface mb-4 px-4 py-3 text-sm font-medium">
          {listing.status === "sold" ? "Acest produs a fost vândut." : "Acest anunț este dezactivat și nu apare în căutări."}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-7">
          <Gallery images={listing.images} title={listing.title} />

          <div>
            <h1 className="text-heading font-semibold sm:text-title">{listing.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/search" search={{ category: listing.category, subcategory: listing.subcategory }} className="badge hover:bg-surface-strong">
                {subcategoryName(listing.category, listing.subcategory)}
              </Link>
              {listing.condition && <span className="badge">{listing.condition === "new" ? "Nou" : "Folosit"}</span>}
              {listing.negotiable && listing.price > 0 && <span className="badge badge-brand">Negociabil</span>}
            </div>
            <div className="mt-4 text-title font-bold text-price lg:hidden">{formatPrice(listing.price)}</div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {specs.map(([k, val]) => (
                <div key={k} className="surface rounded-xl px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 font-semibold">{val}</dd>
                </div>
              ))}
            </dl>
          )}

          <section>
            <h2 className="mb-2 text-lg font-semibold">Descriere</h2>
            {listing.description ? (
              <p className="leading-relaxed whitespace-pre-line text-foreground/90">{listing.description}</p>
            ) : (
              <p className="text-muted-foreground">Vânzătorul nu a adăugat o descriere.</p>
            )}
          </section>

          <p className="text-xs text-muted-foreground">ID anunț: {listing._id}</p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="panel hidden space-y-5 p-6 lg:block">
            <div>
              <div className="text-title font-bold text-price">{formatPrice(listing.price)}</div>
              {listing.negotiable && listing.price > 0 && <div className="mt-1 text-sm text-muted-foreground">Preț negociabil</div>}
            </div>
            <div className="flex gap-2">
              {listing.isOwner ? (
                <Link to="/edit/$id" params={{ id: listing._id }} className="btn btn-primary flex-1">
                  <Pencil /> Editează
                </Link>
              ) : (
                <FavoriteButton listingId={listing._id} isFavorite={listing.isFavorite} withLabel className="flex-1" />
              )}
              <button type="button" className="btn btn-secondary btn-icon" aria-label="Distribuie" onClick={() => share(listing.title)}>
                <Share />
              </button>
            </div>
            {listing.phone && (
              <PhoneButton phone={listing.phone} revealed={showPhone} onReveal={() => setShowPhone(true)} className="w-full" />
            )}
          </div>

          <div className="panel space-y-5 p-6">
            <Link to="/seller/$id" params={{ id: listing.sellerId }} className="group flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-surface">
                <User className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold group-hover:underline">{listing.sellerName}</span>
                <span className="block text-xs text-muted-foreground">
                  {listing.sellerListingCount} {listing.sellerListingCount === 1 ? "anunț activ" : "anunțuri active"}
                </span>
              </span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>

            {canContact && <ContactBox listingId={listing._id} sellerName={listing.sellerName} />}
          </div>

          <p className="flex gap-2 px-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0" />
            Sfat: nu plăti în avans și verifică produsul înainte de a-l cumpăra.
          </p>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          {listing.isOwner ? (
            <Link to="/edit/$id" params={{ id: listing._id }} className="btn btn-primary btn-lg flex-1">
              <Pencil /> Editează anunțul
            </Link>
          ) : (
            <>
              {canContact && (
                <a href="#contact" className="btn btn-primary btn-lg flex-1">
                  Trimite mesaj
                </a>
              )}
              {listing.phone && (
                <PhoneButton
                  phone={listing.phone}
                  revealed={showPhone}
                  onReveal={() => setShowPhone(true)}
                  className="btn-lg flex-1"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
