import { api } from "@ofry/backend/convex/_generated/api";
import { CATEGORIES } from "@ofry/backend/convex/lib/constants";
import { PromoBanner, SectionHeader } from "@ofry/ui/components/ofry";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ChevronRight, Gift, MessageCircle, ShieldCheck, Store, Tag } from "lucide-react";

import { CategoryRailItem, CategoryTile } from "@/components/category-tile";
import { EmptyState } from "@/components/empty-state";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { SearchBar } from "@/components/search-bar";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const latest = useQuery(api.listings.latest, { limit: 16 });
  const counts = useQuery(api.listings.categoryCounts);

  return (
    <div className="container-page space-y-10 pt-4 sm:space-y-14 sm:pt-10">
      <section>
        <h1 className="text-title font-semibold sm:text-display">
          Găsește orice.
          <br className="sm:hidden" /> Vinde orice.
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground sm:mt-3 sm:text-lg">
          Anunțuri gratuite din toată România, de la apartamente și mașini până la haine pentru copii.
        </p>
        <SearchBar size="lg" placeholder="Ce cauți azi?" className="mt-5 max-w-2xl sm:mt-7" />
      </section>

      <section aria-labelledby="categorii">
        <h2 id="categorii" className="sr-only">
          Categorii
        </h2>
        <div className="scroll-rail md:hidden">
          {CATEGORIES.map((c) => (
            <CategoryRailItem key={c.slug} category={c} />
          ))}
        </div>
        <div className="hidden grid-cols-3 gap-3 md:grid lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <CategoryTile key={c.slug} category={c} count={counts?.[c.slug]} />
          ))}
        </div>
      </section>

      <PromoBanner
        title="Vinde gratuit pe Ofry"
        description="Publici un anunț în 2 minute, fără comision."
        action={
          <Link to="/new" className="btn btn-inverse h-10 px-4 sm:h-12 sm:px-6 sm:text-base">
            Adaugă anunț
          </Link>
        }
      />

      <section>
        <div className="mb-5 flex items-center gap-2">
          <div className="scroll-rail mx-0 flex-1 scroll-px-0 gap-2 px-0 sm:mx-0 sm:scroll-px-0 sm:px-0">
            <span className="chip chip-active">Noutăți</span>
            <Link to="/search" search={{ maxPrice: 0 }} className="chip pl-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-highlight text-highlight-foreground [&_svg]:size-3.5">
                <Gift />
              </span>
              Gratuite
            </Link>
            <Link to="/search" search={{ maxPrice: 100 }} className="chip pl-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground [&_svg]:size-3.5">
                <Tag />
              </span>
              Sub 100 lei
            </Link>
          </div>
          <Link to="/search" className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand-ink hover:underline">
            Vezi toate <ChevronRight className="size-4" />
          </Link>
        </div>
        {latest === undefined ? (
          <ListingGridSkeleton />
        ) : latest.length === 0 ? (
          <EmptyState icon={<Store />} title="Încă nu există anunțuri">
            Fii primul care publică un anunț pe Ofry.{" "}
            <Link to="/new" className="font-medium underline underline-offset-4">
              Adaugă un anunț
            </Link>
          </EmptyState>
        ) : (
          <ListingGrid listings={latest} />
        )}
      </section>

      <section>
        <SectionHeader title="De ce Ofry" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: <Gift />, title: "Gratuit", text: "Publici anunțuri fără costuri, în câteva minute." },
            { icon: <MessageCircle />, title: "Mesaje pe platformă", text: "Vorbești cu vânzătorul fără să îți dai numărul." },
            { icon: <ShieldCheck />, title: "Toată țara", text: "Filtrezi după județ și găsești ce e aproape de tine." },
          ].map((f) => (
            <div key={f.title} className="surface flex gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background [&_svg]:size-5">
                {f.icon}
              </span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
