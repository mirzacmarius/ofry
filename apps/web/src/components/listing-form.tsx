import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import {
  CATEGORIES,
  COUNTIES,
  FUELS,
  GEARBOXES,
  MAX_IMAGES,
  getCategory,
} from "@ofry/backend/convex/lib/constants";
import { cn } from "@ofry/ui/lib/utils";
import { useMutation } from "convex/react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { errorMessage } from "@/lib/format";

export type UploadedImage = { storageId: Id<"_storage">; url: string | null };

export type ListingFormValues = {
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  category: string;
  subcategory: string;
  condition: "" | "new" | "used";
  county: string;
  city: string;
  phone: string;
  images: UploadedImage[];
  year: string;
  mileage: string;
  fuel: string;
  gearbox: string;
  rooms: string;
  area: string;
};

export const emptyListingForm: ListingFormValues = {
  title: "",
  description: "",
  price: "",
  negotiable: false,
  category: "",
  subcategory: "",
  condition: "",
  county: "",
  city: "",
  phone: "",
  images: [],
  year: "",
  mileage: "",
  fuel: "",
  gearbox: "",
  rooms: "",
  area: "",
};

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function num(value: string) {
  const n = Number(value.replace(/\s/g, "").replace(",", "."));
  return value.trim() === "" || !Number.isFinite(n) ? undefined : n;
}

/** Converts the form state into the arguments expected by listings.create / update. */
export function toListingArgs(v: ListingFormValues) {
  const attrs = getCategory(v.category)?.attributes ?? [];
  const has = (a: (typeof attrs)[number]) => attrs.includes(a);
  return {
    title: v.title,
    description: v.description,
    price: num(v.price) ?? 0,
    negotiable: v.negotiable,
    category: v.category,
    subcategory: v.subcategory,
    condition: v.condition || undefined,
    county: v.county,
    city: v.city,
    phone: v.phone.trim() || undefined,
    images: v.images.map((i) => i.storageId),
    year: has("year") ? num(v.year) : undefined,
    mileage: has("mileage") ? num(v.mileage) : undefined,
    fuel: has("fuel") ? v.fuel || undefined : undefined,
    gearbox: has("gearbox") ? v.gearbox || undefined : undefined,
    rooms: has("rooms") ? num(v.rooms) : undefined,
    area: has("area") ? num(v.area) : undefined,
  };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel space-y-4 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);

  async function upload(files: FileList) {
    const room = MAX_IMAGES - images.length;
    const selected = Array.from(files).slice(0, room);
    if (files.length > room) toast.warning(`Poți adăuga cel mult ${MAX_IMAGES} imagini.`);
    setUploading(selected.length);
    const added: UploadedImage[] = [];
    for (const file of selected) {
      try {
        if (!file.type.startsWith("image/")) throw new Error(`${file.name} nu este o imagine.`);
        if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} depășește 8 MB.`);
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("Încărcarea a eșuat.");
        const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
        added.push({ storageId, url: URL.createObjectURL(file) });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : errorMessage(err));
      } finally {
        setUploading((n) => n - 1);
      }
    }
    onChange([...images, ...added]);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {images.map((img, i) => (
          <div
            key={img.storageId}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
              i === 0 && "ring-2 ring-primary",
            )}
          >
            {img.url && <img src={img.url} alt="" className="size-full object-cover" />}
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                Principală
              </span>
            )}
            <div className="absolute top-1 right-1 flex gap-1">
              {i > 0 && (
                <button
                  type="button"
                  title="Fă imaginea principală"
                  className="rounded-full bg-black/60 p-1 text-white"
                  onClick={() => onChange([img, ...images.filter((_, j) => j !== i)])}
                >
                  <Star className="size-3" />
                </button>
              )}
              <button
                type="button"
                title="Șterge imaginea"
                className="rounded-full bg-black/60 p-1 text-white"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: uploading }, (_, i) => (
          <div key={`u${i}`} className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ))}
        {images.length + uploading < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <ImagePlus className="size-6" />
            Adaugă poze
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Până la {MAX_IMAGES} poze, maximum 8 MB fiecare. Prima poză apare în rezultatele căutării.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) upload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function ListingForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: ListingFormValues;
  submitLabel: string;
  onSubmit: (values: ListingFormValues) => Promise<void>;
}) {
  const [v, setV] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const set = <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  const category = getCategory(v.category);
  const attrs = category?.attributes ?? [];
  const showCondition = !["imobiliare", "locuri-de-munca", "servicii", "animale"].includes(v.category);

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!v.category || !v.subcategory) return toast.error("Alege o categorie.");
        if (!v.county) return toast.error("Alege județul.");
        setSubmitting(true);
        try {
          await onSubmit(v);
        } catch (err) {
          toast.error(errorMessage(err));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <Section title="Ce vinzi?">
        <div>
          <label className="label" htmlFor="title">
            Titlu
          </label>
          <input
            id="title"
            className="field"
            required
            minLength={3}
            maxLength={100}
            placeholder="ex. iPhone 15 Pro 256GB, ca nou"
            value={v.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="category">
              Categorie
            </label>
            <select
              id="category"
              className="field"
              required
              value={v.category}
              onChange={(e) => setV((p) => ({ ...p, category: e.target.value, subcategory: "" }))}
            >
              <option value="">Alege categoria</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="subcategory">
              Subcategorie
            </label>
            <select
              id="subcategory"
              className="field"
              required
              disabled={!category}
              value={v.subcategory}
              onChange={(e) => set("subcategory", e.target.value)}
            >
              <option value="">Alege subcategoria</option>
              {category?.subcategories.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Poze">
        <ImageUploader images={v.images} onChange={(images) => set("images", images)} />
      </Section>

      <Section title="Detalii">
        <div>
          <label className="label" htmlFor="description">
            Descriere
          </label>
          <textarea
            id="description"
            className="field"
            rows={7}
            maxLength={5000}
            placeholder="Descrie starea produsului, motivul vânzării, ce include..."
            value={v.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{v.description.length}/5000</p>
        </div>

        {showCondition && (
          <div>
            <span className="label">Stare</span>
            <div className="flex gap-2">
              {(
                [
                  ["new", "Nou"],
                  ["used", "Folosit"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={v.condition === value}
                  onClick={() => set("condition", v.condition === value ? "" : value)}
                  className={cn("btn btn-outline", v.condition === value && "border-primary bg-brand-soft text-primary")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {attrs.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {attrs.includes("year") && (
              <div>
                <label className="label" htmlFor="year">
                  An fabricație
                </label>
                <input id="year" className="field" inputMode="numeric" value={v.year} onChange={(e) => set("year", e.target.value)} />
              </div>
            )}
            {attrs.includes("mileage") && (
              <div>
                <label className="label" htmlFor="mileage">
                  Kilometraj (km)
                </label>
                <input id="mileage" className="field" inputMode="numeric" value={v.mileage} onChange={(e) => set("mileage", e.target.value)} />
              </div>
            )}
            {attrs.includes("fuel") && (
              <div>
                <label className="label" htmlFor="fuel">
                  Combustibil
                </label>
                <select id="fuel" className="field" value={v.fuel} onChange={(e) => set("fuel", e.target.value)}>
                  <option value="">Alege</option>
                  {FUELS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}
            {attrs.includes("gearbox") && (
              <div>
                <label className="label" htmlFor="gearbox">
                  Cutie de viteze
                </label>
                <select id="gearbox" className="field" value={v.gearbox} onChange={(e) => set("gearbox", e.target.value)}>
                  <option value="">Alege</option>
                  {GEARBOXES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
            )}
            {attrs.includes("rooms") && (
              <div>
                <label className="label" htmlFor="rooms">
                  Număr camere
                </label>
                <input id="rooms" className="field" inputMode="numeric" value={v.rooms} onChange={(e) => set("rooms", e.target.value)} />
              </div>
            )}
            {attrs.includes("area") && (
              <div>
                <label className="label" htmlFor="area">
                  Suprafață utilă (m²)
                </label>
                <input id="area" className="field" inputMode="decimal" value={v.area} onChange={(e) => set("area", e.target.value)} />
              </div>
            )}
          </div>
        )}
      </Section>

      <Section title="Preț">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="price">
              Preț (lei)
            </label>
            <input
              id="price"
              className="field"
              inputMode="numeric"
              placeholder="0 = gratuit"
              required
              value={v.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[var(--primary)]"
              checked={v.negotiable}
              onChange={(e) => set("negotiable", e.target.checked)}
            />
            Preț negociabil
          </label>
        </div>
      </Section>

      <Section title="Locație și contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="county">
              Județ
            </label>
            <select id="county" className="field" required value={v.county} onChange={(e) => set("county", e.target.value)}>
              <option value="">Alege județul</option>
              {COUNTIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="city">
              Localitate
            </label>
            <input id="city" className="field" required value={v.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Telefon (opțional)
            </label>
            <input
              id="phone"
              className="field"
              type="tel"
              autoComplete="tel"
              placeholder="07xx xxx xxx"
              value={v.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Cumpărătorii te pot contacta oricum prin mesaje pe Ofry. Telefonul este vizibil doar utilizatorilor autentificați.
        </p>
      </Section>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary h-12 px-8 text-base" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
