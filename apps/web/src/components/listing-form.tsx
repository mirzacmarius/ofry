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
import { ProgressBar } from "@ofry/ui/components/ofry-feedback";
import { ChoiceTile, PhotoUploader } from "@ofry/ui/components/ofry-flows";
import { AffixField, RadioCards, Switch } from "@ofry/ui/components/ofry-forms";
import { useMutation } from "convex/react";
import { Gift, Loader2, PackageCheck, Phone, Recycle } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { CategoryIcon, categoryShortName, categoryTintName } from "@/components/category-icon";
import { errorMessage, uploadErrorMessage } from "@/lib/format";
import { uploadImage } from "@/lib/upload";

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

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="panel space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** What's still missing, in the order a seller would fix it. */
function completeness(v: ListingFormValues) {
  const steps: [boolean, string][] = [
    [v.title.trim().length >= 3, "Scrie un titlu"],
    [!!v.category && !!v.subcategory, "Alege categoria"],
    [v.images.length > 0, "Adaugă o poză"],
    [v.price.trim() !== "", "Pune un preț"],
    [!!v.county && !!v.city.trim(), "Spune unde se află"],
    [v.description.trim().length >= 40, "Descrie produsul în câteva rânduri"],
    [v.images.length >= 5, "Adaugă cel puțin 5 poze"],
  ];
  const done = steps.filter(([ok]) => ok).length;
  return { value: (done / steps.length) * 100, next: steps.find(([ok]) => !ok)?.[1] };
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
        const storageId = await uploadImage(file, generateUploadUrl);
        added.push({ storageId, url: URL.createObjectURL(file) });
      } catch (err) {
        toast.error(uploadErrorMessage(err));
      } finally {
        setUploading((n) => n - 1);
      }
    }
    onChange([...images, ...added]);
  }

  return (
    <div>
      <PhotoUploader
        photos={images.map((img) => ({ id: img.storageId, src: img.url }))}
        max={MAX_IMAGES}
        uploading={uploading}
        onAdd={() => inputRef.current?.click()}
        onRemove={(i) => onChange(images.filter((_, j) => j !== i))}
        onMakeCover={(i) => onChange([images[i]!, ...images.filter((_, j) => j !== i)])}
        hint="Maximum 8 MB fiecare. Prima poză apare în rezultate; anunțurile cu 5+ poze primesc mai multe mesaje."
      />
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
  const progress = completeness(v);

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
      <div className="panel sticky top-16 z-10 p-4 sm:p-5">
        <ProgressBar
          value={progress.value}
          label={progress.value >= 100 ? "Anunț complet!" : `${Math.round(progress.value)}% complet`}
          hint={progress.next ?? "Arată foarte bine"}
        />
      </div>

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
        <div>
          <span className="label">Categorie</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((c) => (
              <ChoiceTile
                key={c.slug}
                icon={<CategoryIcon icon={c.icon} />}
                label={categoryShortName(c.slug, c.name)}
                tint={categoryTintName(c.slug)}
                selected={v.category === c.slug}
                onSelect={() => setV((p) => ({ ...p, category: c.slug, subcategory: p.category === c.slug ? p.subcategory : "" }))}
                className="gap-4 p-3"
              />
            ))}
          </div>
        </div>
        {category && (
          <div>
            <span className="label">Subcategorie</span>
            <div className="flex flex-wrap gap-2">
              {category.subcategories.map((sc) => (
                <button key={sc.slug} type="button" className="chip chip-sm" aria-pressed={v.subcategory === sc.slug} onClick={() => set("subcategory", sc.slug)}>
                  {sc.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Poze" hint="Lumină naturală, fundal simplu, din mai multe unghiuri.">
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
            <RadioCards<"new" | "used">
              columns={2}
              name="condition"
              value={v.condition || undefined}
              onValueChange={(c) => set("condition", c)}
              options={[
                { value: "new", label: "Nou", description: "Nefolosit, în ambalaj sau cu etichetă", icon: <PackageCheck /> },
                { value: "used", label: "Folosit", description: "A mai fost folosit și funcționează", icon: <Recycle /> },
              ]}
            />
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

      <Section title="Preț" hint="Un preț corect se vinde mai repede. Pune 0 dacă îl dai gratuit.">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <div>
            <label className="label" htmlFor="price">
              Preț
            </label>
            <AffixField
              id="price"
              end="lei"
              inputMode="numeric"
              placeholder="ex. 450"
              required
              value={v.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </div>
          <button type="button" className="chip w-fit pl-2" aria-pressed={v.price.trim() === "0"} onClick={() => set("price", v.price.trim() === "0" ? "" : "0")}>
            <span className="flex size-6 items-center justify-center rounded-full bg-highlight text-highlight-foreground [&_svg]:size-3.5">
              <Gift />
            </span>
            Îl dau gratuit
          </button>
        </div>
        {v.price.trim() !== "0" && (
          <Switch
            checked={v.negotiable}
            onCheckedChange={(c) => set("negotiable", c)}
            label="Preț negociabil"
            description="Cumpărătorii văd insigna Negociabil și îți pot face oferte."
          />
        )}
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
            <AffixField
              id="phone"
              start={<Phone />}
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
        <button type="submit" className="btn btn-primary btn-lg w-full px-8 sm:w-auto" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
