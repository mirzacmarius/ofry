import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { ImageDots, SectionHeader } from "@ofry/ui/components/ofry";
import { cn } from "@ofry/ui/lib/utils";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Alert, SafetyTip } from "@ofry/ui/components/ofry-feedback";
import { FairPriceMeter, KeyFacts, MapPreview, PriceTag, SellerCard, TrustBadge } from "@ofry/ui/components/ofry-market";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cog,
  Eye,
  Flag,
  Fuel,
  HandCoins,
  Gauge,
  ImageOff,
  MapPin,
  Pencil,
  Phone,
  Ruler,
  Send,
  Share,
  Sparkles,
  Store,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FavoriteButton } from "@/components/favorite-button";
import { ListingGrid } from "@/components/listing-card";
import Loader from "@/components/loader";
import { OfferDialog } from "@/components/offer-dialog";
import { ReportDialog } from "@/components/report-dialog";
import { rememberListing } from "@/lib/local-history";
import { categoryName, errorMessage, formatNumber, monthYear, subcategoryName, timeAgo } from "@/lib/format";

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

function ContactBox({
  listingId,
  sellerName,
  offerPrice,
}: {
  listingId: Id<"listings">;
  sellerName: string;
  /** Set when the seller accepts offers. */
  offerPrice?: number;
}) {
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const contact = useMutation(api.messages.contactSeller);
  const [body, setBody] = useState("Bună ziua! Mai este disponibil?");
  const [sending, setSending] = useState(false);
  const [offering, setOffering] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link id="contact" to="/login" search={{ redirect: location.pathname }} className="btn btn-primary w-full scroll-mt-24">
        <Send /> Intră în cont ca să trimiți un mesaj
      </Link>
    );
  }

  const offer = offerPrice !== undefined && (
    <>
      <button type="button" className="btn btn-brand-outline w-full" onClick={() => setOffering(true)}>
        <HandCoins /> Fă o ofertă
      </button>
      <OfferDialog
        open={offering}
        onClose={() => setOffering(false)}
        listingId={listingId}
        price={offerPrice}
        onSent={(conversationId) => navigate({ to: "/messages/$conversationId", params: { conversationId } })}
      />
    </>
  );

  // The offer dialog stays outside the form: React events bubble through portals.
  return (
    <>
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
    {offer && <div className="mt-2">{offer}</div>}
    </>
  );
}

function ReportButton({ listingId }: { listingId: Id<"listings"> }) {
  const { isAuthenticated } = useConvexAuth();
  const already = useQuery(api.reports.mine, isAuthenticated ? { listingId } : "skip");
  const [open, setOpen] = useState(false);
  const className = "inline-flex items-center gap-1 font-medium hover:text-foreground hover:underline";
  if (!isAuthenticated) {
    return (
      <Link to="/login" search={{ redirect: location.pathname }} className={className}>
        <Flag className="size-3.5" /> Raportează anunțul
      </Link>
    );
  }
  if (already) return <span className="inline-flex items-center gap-1"><Flag className="size-3.5" /> Ai raportat acest anunț</span>;
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <Flag className="size-3.5" /> Raportează anunțul
      </button>
      <ReportDialog open={open} onClose={() => setOpen(false)} listingId={listingId} />
    </>
  );
}

function SimilarListings({ listingId }: { listingId: Id<"listings"> }) {
  const similar = useQuery(api.listings.similar, { id: listingId, limit: 8 });
  if (!similar?.length) return null;
  return (
    <section className="mt-12">
      <SectionHeader title="Anunțuri similare" />
      <ListingGrid listings={similar} />
    </section>
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
  useEffect(() => {
    if (!listing || listing.isOwner || listing.status !== "active") return;
    const { _id, _creationTime, title, price, previousPrice, negotiable, category, subcategory, county, city, status, views, year, mileage, rooms, area } = listing;
    rememberListing({ _id, _creationTime, title, price, previousPrice, negotiable, category, subcategory, county, city, status, views, year, mileage, rooms, area, imageUrl: listing.images[0]?.url ?? null });
  }, [listing]);

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

  const specs: { icon: ReactNode; label: string; value: string }[] = [];
  if (listing.condition) specs.push({ icon: <Sparkles />, label: "Stare", value: listing.condition === "new" ? "Nou" : "Folosit" });
  if (listing.year) specs.push({ icon: <CalendarDays />, label: "An fabricație", value: String(listing.year) });
  if (listing.mileage !== undefined) specs.push({ icon: <Gauge />, label: "Kilometraj", value: `${formatNumber(listing.mileage)} km` });
  if (listing.fuel) specs.push({ icon: <Fuel />, label: "Combustibil", value: listing.fuel });
  if (listing.gearbox) specs.push({ icon: <Cog />, label: "Cutie de viteze", value: listing.gearbox });
  if (listing.rooms) specs.push({ icon: <BedDouble />, label: "Camere", value: String(listing.rooms) });
  if (listing.area) specs.push({ icon: <Ruler />, label: "Suprafață utilă", value: `${listing.area} m²` });
  const stats = listing.priceStats;

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
        <Alert
          tone={listing.status === "sold" ? "info" : "warning"}
          className="mb-4"
          title={listing.status === "sold" ? "Acest produs a fost vândut" : "Anunț dezactivat"}
          action={
            listing.status === "sold" ? (
              <Link to="/search" search={{ category: listing.category, subcategory: listing.subcategory }} className="btn btn-primary btn-sm">
                Vezi anunțuri similare
              </Link>
            ) : undefined
          }
        >
          {listing.status === "sold"
            ? "Vânzătorul l-a marcat ca vândut. Poate găsești ceva asemănător."
            : "Nu apare în căutări. Îl poți reactiva din Anunțurile mele."}
        </Alert>
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
              {listing.price === 0 && <span className="badge badge-highlight">Gratuit</span>}
            </div>
            <PriceTag price={listing.price} oldPrice={listing.previousPrice} negotiable={listing.negotiable} size="lg" className="mt-4 lg:hidden" />
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

          {specs.length > 0 && <KeyFacts facts={specs} className="sm:grid-cols-3 xl:grid-cols-4" />}

          {stats && (
            <section>
              <FairPriceMeter price={listing.price} low={stats.low} high={stats.high} />
              <p className="mt-2 px-1 text-xs text-muted-foreground">
                Comparat cu {stats.count} anunțuri active din {subcategoryName(listing.category, listing.subcategory)}. Orientativ, nu o evaluare.
              </p>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-lg font-semibold">Descriere</h2>
            {listing.description ? (
              <p className="leading-relaxed whitespace-pre-line text-foreground/90">{listing.description}</p>
            ) : (
              <p className="text-muted-foreground">Vânzătorul nu a adăugat o descriere.</p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Locație</h2>
            <MapPreview place={`${listing.city}, ${listing.county}`} detail="Locul exact îl stabilești cu vânzătorul" className="max-w-lg" />
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>ID anunț: {listing._id}</span>
            {!listing.isOwner && <ReportButton listingId={listing._id} />}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="panel hidden space-y-5 p-6 lg:block">
            <PriceTag price={listing.price} oldPrice={listing.previousPrice} negotiable={listing.negotiable} size="lg" />
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

          {listing.isOwner && listing.favoriteCount !== undefined && listing.favoriteCount > 0 && (
            <Alert tone="success" title={listing.favoriteCount === 1 ? "O persoană a salvat anunțul" : `${listing.favoriteCount} persoane au salvat anunțul`}>
              Dacă reduci prețul, le anunțăm imediat.
            </Alert>
          )}

          <SellerCard
            name={listing.sellerName}
            avatar={listing.sellerAvatarUrl}
            memberSince={listing.sellerSince ? monthYear(listing.sellerSince) : "—"}
            activeListings={listing.sellerListingCount}
            badges={listing.phone ? <TrustBadge icon={<Phone />}>Telefon în anunț</TrustBadge> : undefined}
            actions={
              <Link to="/seller/$id" params={{ id: listing.sellerId }} className="btn btn-secondary flex-1">
                <Store /> Toate anunțurile
              </Link>
            }
          />

          {canContact && (
            <div className="panel p-5">
              <ContactBox
                listingId={listing._id}
                sellerName={listing.sellerName}
                offerPrice={listing.negotiable && listing.price > 0 ? listing.price : undefined}
              />
            </div>
          )}

          <SafetyTip
            tips={[
              "Nu plăti în avans și nu trimite coduri primite prin SMS.",
              "Vezi produsul înainte să plătești.",
              "Vorbește prin mesajele Ofry, nu prin linkuri primite.",
            ]}
          />
        </aside>
      </div>

      <SimilarListings listingId={listing._id} />

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
