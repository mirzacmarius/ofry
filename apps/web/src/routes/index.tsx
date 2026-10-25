import { api } from "@ofry/backend/convex/_generated/api";
import { CATEGORIES } from "@ofry/backend/convex/lib/constants";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowRight, ShieldCheck, Sparkles, Store } from "lucide-react";

import { CategoryIcon } from "@/components/category-icon";
import { EmptyState } from "@/components/empty-state";
import { HeaderSearch } from "@/components/header";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing-card";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const latest = useQuery(api.listings.latest, { limit: 16 });
  const counts = useQuery(api.listings.categoryCounts);

  return (
    <div>
      <section className="bg-brand-soft">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
            Găsește orice. <span className="text-primary">Vinde orice.</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground sm:text-lg">
            Anunțuri gratuite din toată România: de la apartamente și mașini până la haine pentru copii.
          </p>
          <HeaderSearch className="mt-6 max-w-2xl [&_input]:h-12 [&_input]:text-base [&_input]:shadow-sm" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="mb-4 text-xl font-bold">Categorii</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/search"
              search={{ category: c.slug }}
              className="panel group flex flex-col items-start gap-3 p-4 transition hover:border-primary hover:shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-primary">
                <CategoryIcon icon={c.icon} className="size-5" />
              </span>
              <span className="text-sm leading-tight font-semibold group-hover:text-primary">{c.name}</span>
              <span className="text-xs text-muted-foreground">
                {counts ? `${formatNumber(counts[c.slug] ?? 0)} anunțuri` : " "}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">Anunțuri noi</h2>
          <Link to="/search" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Vezi toate <ArrowRight className="size-4" />
          </Link>
        </div>
        {latest === undefined ? (
          <ListingGridSkeleton />
        ) : latest.length === 0 ? (
          <EmptyState icon={<Store />} title="Încă nu există anunțuri">
            Fii primul care publică un anunț pe Ofry.{" "}
            <Link to="/new" className="font-medium text-primary hover:underline">
              Adaugă un anunț
            </Link>
          </EmptyState>
        ) : (
          <ListingGrid listings={latest} />
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: <Sparkles />, title: "Gratuit", text: "Publici anunțuri fără costuri, în câteva minute." },
            { icon: <ShieldCheck />, title: "Mesaje pe platformă", text: "Vorbești cu vânzătorul fără să îți dai numărul." },
            { icon: <Store />, title: "Toată țara", text: "Filtrezi după județ și găsești ce e aproape de tine." },
          ].map((f) => (
            <div key={f.title} className="panel flex gap-3 p-5">
              <span className="text-primary [&_svg]:size-6">{f.icon}</span>
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
