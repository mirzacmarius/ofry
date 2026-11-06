# Ofry design system

Ofry looks friendly and photo-first. The palette is **Violet**: white pages,
cool lavender-grey wells that hold photos and tiles, navy ink for text, a
confident violet for primary actions and active states, a violet-to-periwinkle
gradient for promo banners, sunny yellow for badges worth spotting, and a soft
pastel tint per category. Corners are generously rounded and shadows are
almost absent.

Live preview: open **`/design`** in the app (tokens, every component, phone mock-ups).

## Where things live

| What | File |
| --- | --- |
| Tokens (colour, type, radius, shadow) | `packages/ui/src/styles/globals.css` |
| Component classes (`.btn`, `.chip`, `.field`…) | `packages/ui/src/styles/components.css` |
| Presentational React components | `packages/ui/src/components/ofry.tsx` (`PromoBanner`, `SectionHeader`, `Rating`, `ImageDots`) |
| Form controls | `packages/ui/src/components/ofry-forms.tsx` |
| Feedback surfaces | `packages/ui/src/components/ofry-feedback.tsx` |
| Marketplace pieces | `packages/ui/src/components/ofry-market.tsx` |
| Chat and offers | `packages/ui/src/components/ofry-chat.tsx` |
| Posting and search flows | `packages/ui/src/components/ofry-flows.tsx` |
| Live catalogue | `/design` (`apps/web/src/routes/design.tsx`, `apps/web/src/components/design/`) |
| App components built on the system | `apps/web/src/components/` (`listing-card`, `category-tile`, `search-bar`, `bottom-nav`, `logo`) |
| Font | Onest Variable via `@fontsource-variable/onest` (full Romanian diacritics) |

The shadcn primitives in `packages/ui/src/components` read the same tokens, so
`Button`, `Input`, dropdowns and toasts match automatically.

## Colour roles

Always use the role, never a raw value. Every role has a dark-mode value.

| Role | Tailwind | Use for |
| --- | --- | --- |
| `--background` | `bg-background` | Page background (white) |
| `--surface` | `bg-surface` | Lavender grey: photo wells, inputs, spec boxes |
| `--surface-strong` | `bg-surface-strong` | Hover on surfaces |
| `--foreground` / `--ink` | `text-foreground`, `bg-ink` | Navy ink: text, the Vândut badge, neutral emphasis |
| `--primary` = `--brand` | `bg-primary`, `bg-brand` | Violet: primary buttons, active chips and tabs, publish button, filled hearts |
| `--brand-ink` | `text-brand-ink` | Violet text and links (Vezi toate) |
| `--brand-soft` | `bg-brand-soft` | Lavender: positive badges, outline-button hover |
| `--highlight` | `bg-highlight` | Yellow: Gratuit / Nou / Top badges, the logo dot |
| `--promo` → `--promo-to` | `bg-linear-to-br from-promo to-promo-to` | Promo banner gradient |
| `--ofry-tint-*` | `.tile-tinted` + `categoryTint(slug)` | Pastel category tiles (lavender, periwinkle, butter, mint, peach, sky, pink, slate) |
| `--muted-foreground` | `text-muted-foreground` | Meta lines, help text |
| `--border` | `border-border` | Hairlines on white panels |
| `--price` | `text-price` | Prices (always bold, ink) |
| `--favorite` | `text-favorite` | Filled heart (violet) |

Contrast: white on violet is 6.4:1, ink on yellow 12.5:1, white on the banner
gradient's darker end 4.8:1. In dark mode the violet lightens and its text
turns dark.

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

- `btn-primary` violet: the main action (Trimite mesaj, Caută). `btn-accent` is the same fill, used for the publish CTA.
- `btn-brand-outline` violet outline: the second action next to a primary one (Sună next to Trimite mesaj).
- One filled violet button per area; everything else is `btn-secondary` (grey), `btn-outline`, `btn-ghost`, `btn-ink`, `btn-danger`, or `btn-inverse` (white, on the promo banner).
- Sizes: `btn-sm` (36), default (44), `btn-lg` (56, phone action bars). `btn-icon` makes it square.
- `.icon-btn`: round translucent button for overlays on photos (heart, gallery arrows).

**Chips and badges**

- `.chip` for filters and toggles; active state via `aria-pressed="true"` or `.chip-active` (violet). `.chip-sm` for dense rows.
- A chip may lead with a small coloured circle icon (yellow for Gratuite, violet for Sub 100 lei).
- `.badge` is informational only: grey by default, `badge-brand` (lavender), `badge-highlight` (yellow: Gratuit), `badge-dark` (ink: Vândut).

**Fields**: `.field` on `input`, `select`, `textarea`. Lavender grey and borderless; white with a violet ring on focus. Labels use `.label`.

**Search bar**: `<SearchBar />` (`size="lg"` for the home hero).

**Category tiles**: `<CategoryTile />` (pastel tile, label top-left, big icon bottom-right) for grids; `<CategoryRailItem />` (square tile, label below) for the horizontal rail on phones (`.scroll-rail`).

**Listing card**: photo in a square lavender-grey well with a heart `icon-btn` and a yellow Gratuit badge for free items, then title, bold price, and a muted `oraș · timp` line. No border. Use `<ListingGrid />` so hearts reflect the user's favourites.

**Promo banner**: `<PromoBanner title description action />`. Violet-to-periwinkle gradient with a soft light shape. At most one per screen, for Ofry's own messages.

**Section header**: `<SectionHeader title action />`, action usually `Vezi toate ›`.

**Bottom nav** (phones only): Acasă, Caută, a violet round publish button, Favorite, Contul meu. Active tab is violet with a filled icon. It hides on the listing page, which brings its own sticky bar (violet Trimite mesaj + violet-outline Sună).

## Component catalogue

All of these are presentational: they take data and callbacks and hold at most
their own UI state. Every one is shown on `/design`, in light and dark.

| File | Components | Notes |
| --- | --- | --- |
| `ofry-forms` | `Switch`, `Checkbox`, `RadioCards`, `Segmented`, `Tabs`, `Stepper`, `PriceRange`, `RatingInput`, `AffixField` | Controlled or uncontrolled (`value` / `defaultValue`). `PriceRange` draws a histogram of the market above the slider. `AffixField` takes `start` / `end` slots. |
| `ofry-feedback` | `Alert`, `SafetyTip`, `ToastCard`, `DialogCard`, `SheetCard`, `TooltipBubble`, `ProgressBar`, `ProgressRing`, `TypingDots`, `EmptyArt` | Alert tones: info, success, warning, danger. Toasts and tooltips are ink. Empty states pair `EmptyArt` with one verb button. |
| `ofry-market` | `Avatar`, `AvatarStack`, `TrustBadge`, `SellerCard`, `PriceTag`, `FairPriceMeter`, `ListingRow`, `PromotedCard`, `KeyFacts`, `CollectionTile`, `Countdown`, `PlanCard`, `MapPreview`, `Sparkline`, `StatTile`, `NotificationItem`, `StepProgress`, `Pagination`, `formatLei` | Avatars without a photo get a pastel tint picked from the name. `FairPriceMeter` says Preț bun / Preț corect / Peste piață. `MapPreview` always shows an approximate zone, never an exact address. |
| `ofry-chat` | `MessageBubble`, `OfferBubble`, `TypingBubble`, `DateDivider`, `QuickReplies`, `ChatComposer`, `ConversationRow` | Mine is violet with the tail bottom-right; theirs is grey. Offers are a gradient ticket with a status badge and Accept / Refuz while pending. |
| `ofry-flows` | `PhotoUploader`, `ChoiceTile`, `SearchSuggest` | The first photo is the cover (2×2, yellow Copertă badge). `ChoiceTile` is a tinted tile with a check, for category pickers and onboarding. |

## Copy

Romanian, sentence case, short. Prices in lei. Buttons are verbs (Trimite mesaj, Adaugă anunț, Salvează).
