# Ofry design system

Ofry looks calm and photo-first: white pages, soft grey wells that hold photos
and tiles, near-black text and buttons, one bright green "go" action per screen
and a deep forest green for promotional banners. Corners are generously rounded
and shadows are almost absent.

Live preview: open **`/design`** in the app (tokens, every component, phone mock-ups).

## Where things live

| What | File |
| --- | --- |
| Tokens (colour, type, radius, shadow) | `packages/ui/src/styles/globals.css` |
| Component classes (`.btn`, `.chip`, `.field`…) | `packages/ui/src/styles/components.css` |
| Presentational React components | `packages/ui/src/components/ofry.tsx` (`PromoBanner`, `SectionHeader`, `Rating`, `ImageDots`) |
| App components built on the system | `apps/web/src/components/` (`listing-card`, `category-tile`, `search-bar`, `bottom-nav`, `logo`) |
| Font | Onest Variable via `@fontsource-variable/onest` (full Romanian diacritics) |

The shadcn primitives in `packages/ui/src/components` read the same tokens, so
`Button`, `Input`, dropdowns and toasts match automatically.

## Colour roles

Always use the role, never a raw value. Every role has a dark-mode value.

| Role | Tailwind | Use for |
| --- | --- | --- |
| `--background` | `bg-background` | Page background (white) |
| `--surface` | `bg-surface` | Photo wells, tiles, inputs, spec boxes |
| `--surface-strong` | `bg-surface-strong` | Hover on surfaces |
| `--primary` | `bg-primary` / `text-foreground` | Ink: text, default buttons, active chips |
| `--brand` | `bg-brand` | The single bright-green CTA (Adaugă anunț, Sună), unread dots |
| `--brand-ink` | `text-brand-ink` | Green text on light backgrounds |
| `--brand-soft` | `bg-brand-soft` | Positive badges (Negociabil, Activ) |
| `--promo` | `bg-promo` | Forest-green promotional banners |
| `--muted-foreground` | `text-muted-foreground` | Meta lines, help text |
| `--border` | `border-border` | Hairlines on white panels |
| `--price` | `text-price` | Prices (always bold) |
| `--favorite` | `text-favorite` | Filled heart |

Text on the bright green is ink, not white, to keep AA contrast.

## Type

Onest, one family. Headings are semibold with slightly tight tracking.

| Token | Size / line | Use |
| --- | --- | --- |
| `text-display` | 44 / 46 | Home hero on desktop |
| `text-title` | 28 / 32 | Page titles, listing title on desktop, big prices |
| `text-heading` | 22 / 26 | Section titles |
| `text-lg` | 18 | Card prices on desktop, sub-sections |
| `text-base` | 16 | Body |
| `text-sm` | 14 | Secondary text, buttons |
| `text-xs` | 12 | Meta |

Prices: `font-bold text-price`, formatted with `formatPrice()` (`1.850 lei`, `Gratuit`).

## Spacing, radius, elevation

- 4 px grid (Tailwind default). Page gutter 16 px on phones, 24 px from `sm` (`.container-page`).
- Sections sit 40–56 px apart (`space-y-10 sm:space-y-14`).
- Radius: `sm` 8, `md` 12, `lg` 14 (buttons, inputs), `xl` 18 (large buttons), `2xl` 22 (cards, tiles, banners), `3xl` 28 (gallery), `full` for chips, badges and icon buttons.
- Elevation is mostly flat. `shadow-xs` for icon buttons on photos, `shadow-md` for the floating publish button, `shadow-lg` for popovers.

## Components

**Buttons** (`.btn` + one variant, optional size)

- `btn-primary` black: the normal action (Trimite mesaj, Caută, Intră în cont).
- `btn-accent` green: the one "go" moment on a screen (Adaugă anunț, Sună). Never two on one screen.
- `btn-secondary` grey, `btn-outline`, `btn-ghost`, `btn-danger`, `btn-inverse` (white, on promo green).
- Sizes: `btn-sm` (36), default (44), `btn-lg` (56, phone action bars). `btn-icon` makes it square.
- `.icon-btn`: round translucent button for overlays on photos (heart, gallery arrows).

**Chips and badges**

- `.chip` for filters and toggles; active state via `aria-pressed="true"` or `.chip-active` (black). `.chip-sm` for dense rows.
- A chip may lead with a small green circle icon (Gratuite, Sub 100 lei).
- `.badge` is informational only: grey by default, `badge-brand` (green), `badge-dark` (Vândut).

**Fields**: `.field` on `input`, `select`, `textarea`. Grey and borderless; white with a green ring on focus. Labels use `.label`.

**Search bar**: `<SearchBar />` (`size="lg"` for the home hero).

**Category tiles**: `<CategoryTile />` (grey tile, label top-left, big icon bottom-right) for grids; `<CategoryRailItem />` (square tile, label below) for the horizontal rail on phones (`.scroll-rail`).

**Listing card**: photo in a square grey well with a heart `icon-btn`, then title, bold price, and a muted `oraș · timp` line. No border. Use `<ListingGrid />` so hearts reflect the user's favourites.

**Promo banner**: `<PromoBanner title description action />`. Forest green with a lighter curved shape. At most one per screen, for Ofry's own messages.

**Section header**: `<SectionHeader title action />`, action usually `Vezi toate ›`.

**Bottom nav** (phones only): Acasă, Caută, a green round publish button, Favorite, Contul meu. Active tab is ink with a filled icon. It hides on the listing page, which brings its own sticky bar (black Trimite mesaj + green Sună).

## Copy

Romanian, sentence case, short. Prices in lei. Buttons are verbs (Trimite mesaj, Adaugă anunț, Salvează).
