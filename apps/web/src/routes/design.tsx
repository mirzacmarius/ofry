import type { ListingCard as Card } from "@ofry/backend/convex/lib/cards";
import { CATEGORIES } from "@ofry/backend/convex/lib/constants";
import { placeholderSvg } from "@ofry/backend/convex/lib/placeholder";
import { ImageDots, PromoBanner, Rating, SectionHeader } from "@ofry/ui/components/ofry";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Gift, Heart, Home, MessageCircle, Phone, Plus, Search, Tag, User, X } from "lucide-react";
import type { ReactNode } from "react";

import { CategoryRailItem, CategoryTile } from "@/components/category-tile";
import { ListingCard } from "@/components/listing-card";
import { Logo } from "@/components/logo";
import { SearchBar } from "@/components/search-bar";

export const Route = createFileRoute("/design")({
  component: DesignPage,
  head: () => ({ meta: [{ title: "Sistemul de design Ofry" }, { name: "robots", content: "noindex" }] }),
});

function photo(category: string, subcategory: string, seed: number) {
  const svg = placeholderSvg({ title: "", category, subcategory, index: 0, total: 1, seed });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const HOUR = 3_600_000;
const SAMPLE: Card[] = [
  { title: "Fotoliu tapițat, verde, ca nou", price: 450, category: "casa-gradina", subcategory: "mobila", city: "Cluj-Napoca", county: "Cluj", age: 2 },
  { title: "iPhone 13, 128 GB, baterie 89%", price: 1850, category: "electronice", subcategory: "telefoane", city: "București", county: "București", age: 5 },
  { title: "Bicicletă de oraș, cadru aluminiu", price: 0, category: "sport-hobby", subcategory: "biciclete", city: "Iași", county: "Iași", age: 30 },
  { title: "Dacia Logan 1.0 SCe", price: 38500, category: "auto", subcategory: "autoturisme", city: "Brașov", county: "Brașov", age: 80, year: 2019, mileage: 64000, status: "sold" as const },
].map((s, i) => ({
  _id: `design-${i}` as Card["_id"],
  _creationTime: Date.now() - s.age * HOUR,
  title: s.title,
  price: s.price,
  negotiable: true,
  category: s.category,
  subcategory: s.subcategory,
  county: s.county,
  city: s.city,
  status: s.status ?? "active",
  views: 120,
  year: s.year,
  mileage: s.mileage,
  rooms: undefined,
  area: undefined,
  imageUrl: photo(s.category, s.subcategory, i + 3),
}));

const COLORS: { name: string; token: string; className: string; note: string }[] = [
  { name: "Fundal", token: "--background", className: "bg-background", note: "Paginile sunt albe" },
  { name: "Suprafață", token: "--surface", className: "bg-surface", note: "Plăci, poze, câmpuri" },
  { name: "Suprafață tare", token: "--surface-strong", className: "bg-surface-strong", note: "Hover pe suprafețe" },
  { name: "Cerneală", token: "--primary", className: "bg-primary", note: "Text și butonul principal" },
  { name: "Smarald", token: "--brand", className: "bg-brand", note: "Un singur CTA „go” pe ecran" },
  { name: "Verde închis", token: "--brand-ink", className: "bg-brand-ink", note: "Text verde pe fundal deschis" },
  { name: "Verde pal", token: "--brand-soft", className: "bg-brand-soft", note: "Insigne pozitive" },
  { name: "Smarald închis", token: "--promo", className: "bg-promo", note: "Bannere promoționale" },
  { name: "Text secundar", token: "--muted-foreground", className: "bg-muted-foreground", note: "Meta, ajutor" },
  { name: "Bordură", token: "--border", className: "bg-border", note: "Linii fine, panouri" },
  { name: "Coral", token: "--favorite", className: "bg-favorite", note: "Inimă plină" },
  { name: "Rating", token: "--rating", className: "bg-rating", note: "Stele" },
];

const TYPE: { label: string; className: string; spec: string }[] = [
  { label: "Găsește orice", className: "text-display font-semibold", spec: "display · 44/46 · semibold" },
  { label: "Fotoliu tapițat, verde", className: "text-title font-semibold", spec: "title · 28/32 · semibold" },
  { label: "Anunțuri noi", className: "text-heading font-semibold", spec: "heading · 22/26 · semibold" },
  { label: "Descriere", className: "text-lg font-semibold", spec: "lg · 18/28 · semibold" },
  { label: "Vând fotoliu în stare foarte bună, folosit un an.", className: "text-base", spec: "base · 16/24 · regular" },
  { label: "Cluj-Napoca · acum 2 ore", className: "text-sm text-muted-foreground", spec: "sm · 14/20 · regular" },
  { label: "Imagine demonstrativă", className: "text-xs text-muted-foreground", spec: "xs · 12/16 · regular" },
];

function Block({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-10">
      <div className="mb-6">
        <h2 className="text-heading font-semibold">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Phone375({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-[300px] overflow-hidden rounded-[2.5rem] border-[10px] border-neutral-950 bg-background shadow-lg">
      {children}
    </div>
  );
}

function DesignPage() {
  return (
    <div className="container-page pt-6 pb-20">
      <header className="pb-10">
        <Logo className="text-4xl" />
        <h1 className="mt-4 text-title font-semibold sm:text-display">Sistemul de design</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Paleta „Smarald cald”: pagini albe, suprafețe calde de piatră care țin pozele, text și butoane verde-negru,
          smarald pentru acțiunea principală, smarald închis pentru bannere și coral pentru inimi. Colțuri rotunjite, umbre aproape deloc. Reguli complete în{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-sm">docs/DESIGN.md</code>.
        </p>
      </header>

      <Block title="Culori" description="Folosește rolurile semantice (bg-surface, text-price), nu valori brute. Toate au și variantă pentru tema întunecată.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {COLORS.map((c) => (
            <div key={c.token} className="panel overflow-hidden">
              <div className={`h-20 border-b border-border ${c.className}`} />
              <div className="p-3">
                <div className="text-sm font-semibold">{c.name}</div>
                <code className="text-xs text-muted-foreground">{c.token}</code>
                <div className="mt-1 text-xs text-muted-foreground">{c.note}</div>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Tipografie" description="Onest, un sans-serif geometric cu diacritice românești complete (ă, â, î, ș, ț). Titlurile au tracking ușor negativ.">
        <div className="space-y-5">
          {TYPE.map((t) => (
            <div key={t.spec} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
              <code className="w-56 shrink-0 text-xs text-muted-foreground">{t.spec}</code>
              <div className={t.className}>{t.label}</div>
            </div>
          ))}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
            <code className="w-56 shrink-0 text-xs text-muted-foreground">preț · bold · text-price</code>
            <div className="text-lg font-bold text-price">1.850 lei</div>
          </div>
        </div>
      </Block>

      <Block title="Spațiere, colțuri, umbre" description="Grilă de 4 px. Margini de pagină 16 px pe telefon, 24 px pe desktop. Secțiuni la 40–56 px distanță.">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-2">
            {[1, 2, 3, 4, 6, 8, 10, 14].map((n) => (
              <div key={n} className="flex items-center gap-3 text-xs text-muted-foreground">
                <code className="w-10">{n * 4}px</code>
                <div className="h-3 rounded-sm bg-brand" style={{ width: n * 4 * 2 }} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["sm", "rounded-sm", "8"],
              ["md", "rounded-md", "12"],
              ["lg", "rounded-lg", "14"],
              ["xl", "rounded-xl", "18"],
              ["2xl", "rounded-2xl", "22"],
              ["full", "rounded-full", "∞"],
            ].map(([name, cls, px]) => (
              <div key={name} className="text-center text-xs text-muted-foreground">
                <div className={`mx-auto mb-1.5 size-16 bg-surface-strong ${cls}`} />
                {name} · {px}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["shadow-xs", "shadow-sm", "shadow-md", "shadow-lg"].map((s) => (
              <div key={s} className={`flex h-16 items-center justify-center rounded-xl bg-card text-xs text-muted-foreground ${s}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </Block>

      <Block title="Butoane" description="Negru pentru acțiunea obișnuită, verde pentru momentul „hai” (Adaugă anunț, Sună), gri pentru restul. Maxim un buton verde pe ecran.">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary">Trimite mesaj</button>
          <button type="button" className="btn btn-accent">
            <Plus strokeWidth={2.5} /> Adaugă anunț
          </button>
          <button type="button" className="btn btn-secondary">Salvează</button>
          <button type="button" className="btn btn-outline">Intră în cont</button>
          <button type="button" className="btn btn-ghost">Anulează</button>
          <button type="button" className="btn btn-danger">Șterge</button>
          <button type="button" className="btn btn-primary" disabled>Dezactivat</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary btn-sm">Mic</button>
          <button type="button" className="btn btn-primary">Normal</button>
          <button type="button" className="btn btn-primary btn-lg">Mare</button>
          <button type="button" className="btn btn-secondary btn-icon" aria-label="Favorite">
            <Heart />
          </button>
          <button type="button" className="icon-btn" aria-label="Favorite pe poză">
            <Heart />
          </button>
        </div>
        <div className="mt-6 flex max-w-md gap-2">
          <button type="button" className="btn btn-primary btn-lg flex-1">Trimite mesaj</button>
          <button type="button" className="btn btn-accent btn-lg flex-1">
            <Phone /> Sună
          </button>
        </div>
      </Block>

      <Block title="Chips și insigne" description="Chips pentru filtre și comutatoare (negre când sunt active). Insignele sunt doar informative.">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-active">Noutăți</span>
          <span className="chip pl-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground [&_svg]:size-3.5">
              <Gift />
            </span>
            Gratuite
          </span>
          <span className="chip pl-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground [&_svg]:size-3.5">
              <Tag />
            </span>
            Sub 100 lei
          </span>
          <span className="chip chip-sm chip-active">
            Cluj <X className="size-3" />
          </span>
          <span className="chip chip-sm">Folosit</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="badge">Mobilă</span>
          <span className="badge">Folosit</span>
          <span className="badge badge-brand">Negociabil</span>
          <span className="badge badge-dark">Vândut</span>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-8">
          <Rating value={4.9} count={332} />
          <ImageDots count={4} active={0} />
        </div>
      </Block>

      <Block title="Câmpuri și căutare" description="Câmpurile sunt gri, fără bordură; la focus devin albe cu inel verde.">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <SearchBar size="lg" placeholder="Ce cauți azi?" className="sm:col-span-2" />
          <div>
            <label className="label" htmlFor="ds-title">
              Titlu
            </label>
            <input id="ds-title" className="field" placeholder="ex. Fotoliu tapițat verde" />
          </div>
          <div>
            <label className="label" htmlFor="ds-county">
              Județ
            </label>
            <select id="ds-county" className="field" defaultValue="Cluj">
              <option>Cluj</option>
              <option>București</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ds-desc">
              Descriere
            </label>
            <textarea id="ds-desc" className="field" placeholder="Spune cumpărătorilor starea produsului…" />
          </div>
        </div>
      </Block>

      <Block title="Categorii" description="Plăci gri: pe telefon un șir orizontal cu eticheta sub poză, pe desktop o grilă cu eticheta sus și iconița jos-dreapta.">
        <div className="scroll-rail mb-6">
          {CATEGORIES.map((c) => (
            <CategoryRailItem key={c.slug} category={c} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.slice(0, 5).map((c, i) => (
            <CategoryTile key={c.slug} category={c} count={[1240, 860, 2310, 1795, 640][i]} />
          ))}
        </div>
      </Block>

      <Block title="Carduri de anunț" description="Poza într-un godeu gri cu colțuri de 22 px, inima în colț, apoi titlul, prețul îngroșat și o linie de meta.">
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
          {SAMPLE.map((l, i) => (
            <ListingCard key={l._id} listing={l} isFavorite={i === 1} />
          ))}
        </div>
      </Block>

      <Block title="Banner promo" description="Smarald închis cu o formă mai deschisă în dreapta. Unul pe ecran, pentru mesajele Ofry.">
        <PromoBanner
          title="Vinde gratuit pe Ofry"
          description="Publici un anunț în 2 minute, fără comision."
          action={
            <button type="button" className="btn btn-inverse h-10 px-4 sm:h-12 sm:px-6 sm:text-base">
              Adaugă anunț
            </button>
          }
        />
        <SectionHeader
          className="mt-8"
          title="Anunțuri noi"
          action={
            <span className="flex items-center gap-0.5">
              Vezi toate <ChevronRight className="size-4" />
            </span>
          }
        />
      </Block>

      <Block title="Pe telefon" description="Bara de jos cu cinci tab-uri și butonul verde de publicare în mijloc. Pagina de anunț își aduce propria bară cu Trimite mesaj și Sună.">
        <div className="flex flex-wrap justify-center gap-10">
          <Phone375>
            <div className="space-y-4 p-4 pt-6">
              <Logo />
              <div className="field flex items-center gap-2 text-muted-foreground">
                <Search className="size-[1.125rem]" /> Caută pe Ofry
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {SAMPLE.slice(0, 2).map((l) => (
                  <ListingCard key={l._id} listing={l} isFavorite={false} />
                ))}
              </div>
            </div>
            <div className="flex items-center border-t border-border px-1 pt-1 pb-3">
              {[
                [<Home key="h" className="fill-current" />, "Acasă", true],
                [<Search key="s" />, "Caută", false],
              ].map(([icon, label, active]) => (
                <span key={label as string} className={`flex flex-1 flex-col items-center gap-1 py-2 text-[0.6875rem] font-medium [&_svg]:size-6 ${active ? "" : "text-muted-foreground"}`}>
                  {icon}
                  {label}
                </span>
              ))}
              <span className="flex flex-1 justify-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-md">
                  <Plus className="size-6" strokeWidth={2.5} />
                </span>
              </span>
              {[
                [<Heart key="f" />, "Favorite"],
                [<User key="u" />, "Contul meu"],
              ].map(([icon, label]) => (
                <span key={label as string} className="flex flex-1 flex-col items-center gap-1 py-2 text-[0.6875rem] font-medium text-muted-foreground [&_svg]:size-6">
                  {icon}
                  {label}
                </span>
              ))}
            </div>
          </Phone375>
          <Phone375>
            <div className="p-4 pt-6">
              <div className="surface aspect-square overflow-hidden rounded-3xl">
                <img src={SAMPLE[0]!.imageUrl ?? ""} alt="" className="size-full object-cover" />
              </div>
              <ImageDots count={3} active={0} className="mt-3" />
              <h3 className="mt-3 text-lg leading-snug font-semibold">{SAMPLE[0]!.title}</h3>
              <div className="mt-2 flex gap-1.5">
                <span className="badge">Mobilă</span>
                <span className="badge badge-brand">Negociabil</span>
              </div>
              <div className="mt-3 text-heading font-bold text-price">450 lei</div>
              <p className="mt-1 text-xs text-muted-foreground">Cluj-Napoca · acum 2 ore</p>
            </div>
            <div className="flex gap-2 border-t border-border p-3">
              <span className="btn btn-primary flex-1 px-2">
                <MessageCircle /> Mesaj
              </span>
              <span className="btn btn-accent flex-1 px-2">
                <Phone /> Sună
              </span>
            </div>
          </Phone375>
        </div>
      </Block>
    </div>
  );
}
