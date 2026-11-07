import { api } from "@ofry/backend/convex/_generated/api";
import { COUNTIES } from "@ofry/backend/convex/lib/constants";
import { Alert, DialogCard, ProgressRing } from "@ofry/ui/components/ofry-feedback";
import { AffixField } from "@ofry/ui/components/ofry-forms";
import { Avatar } from "@ofry/ui/components/ofry-market";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Bell, BellRing, Camera, ChevronRight, Heart, KeyRound, Loader2, LogOut, MessageCircle, Phone, Store, Trash2, UserRound } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Modal, sheetOnPhone } from "@/components/modal";
import { authClient } from "@/lib/auth-client";
import { errorMessage, uploadErrorMessage } from "@/lib/format";
import { uploadImage } from "@/lib/upload";

export const Route = createFileRoute("/_auth/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Contul meu · Ofry.ro" }] }),
});

type Me = NonNullable<ReturnType<typeof useMe>>;
const useMe = () => useQuery(api.account.me);

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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function completeness(me: Me) {
  const steps: [boolean, string][] = [
    [!!me.name.trim(), "adaugă numele"],
    [!!me.avatarUrl, "adaugă o poză de profil"],
    [!!me.phone, "adaugă un număr de telefon"],
    [!!me.county && !!me.city, "spune din ce oraș ești"],
    [!!me.bio, "scrie câteva cuvinte despre tine"],
    [me.hasListing, "publică primul anunț"],
  ];
  const missing = steps.filter(([ok]) => !ok).map(([, label]) => label);
  return { done: steps.length - missing.length, total: steps.length, missing };
}

function AvatarPicker({ me }: { me: Me }) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const setAvatar = useMutation(api.account.setAvatar);
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="relative">
      <Avatar name={me.name || me.email} src={me.avatarUrl} size="xl" />
      <button
        type="button"
        aria-label="Schimbă poza de profil"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-3 ring-background"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            await setAvatar({ storageId: await uploadImage(file, generateUploadUrl) });
            toast.success("Poza de profil a fost schimbată");
          } catch (err) {
            toast.error(uploadErrorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

function ProfileForm({ me }: { me: Me }) {
  const updateProfile = useMutation(api.account.updateProfile);
  const syncName = useMutation(api.account.syncName);
  const [v, setV] = useState({ name: me.name, phone: me.phone, county: me.county, city: me.city, bio: me.bio });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const name = v.name.trim();
        if (name.length < 2) return toast.error("Numele trebuie să aibă cel puțin 2 caractere.");
        setSaving(true);
        try {
          if (name !== me.name) {
            const { error } = await authClient.updateUser({ name });
            if (error) throw new Error(error.message || "Nu am putut schimba numele.");
            await syncName();
          }
          await updateProfile({ phone: v.phone, county: v.county, city: v.city, bio: v.bio });
          toast.success("Profil salvat");
        } catch (err) {
          toast.error(uploadErrorMessage(err));
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Nume afișat
          </label>
          <input id="name" className="field" autoComplete="name" value={v.name} onChange={set("name")} maxLength={60} />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Telefon
          </label>
          <AffixField id="phone" start={<Phone />} type="tel" autoComplete="tel" placeholder="07xx xxx xxx" value={v.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className="label" htmlFor="county">
            Județ
          </label>
          <select id="county" className="field" value={v.county} onChange={set("county")}>
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
          <input id="city" className="field" autoComplete="address-level2" value={v.city} onChange={set("city")} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="bio">
          Despre tine
        </label>
        <textarea id="bio" className="field" rows={3} maxLength={500} placeholder="ex. Vând lucrurile copiilor, ridicare din Mănăștur seara." value={v.bio} onChange={set("bio")} />
        <p className="mt-1 text-xs text-muted-foreground">Apare pe pagina ta de vânzător. Telefonul, județul și localitatea se completează singure în anunțurile noi.</p>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          Salvează profilul
        </button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (next.length < 8) return toast.error("Parola nouă trebuie să aibă cel puțin 8 caractere.");
        setSaving(true);
        const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
        setSaving(false);
        if (error) return toast.error(error.message || "Parola actuală nu este corectă.");
        setCurrent("");
        setNext("");
        toast.success("Parola a fost schimbată. Celelalte dispozitive au fost deconectate.");
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="current-password">
            Parola actuală
          </label>
          <input id="current-password" type="password" className="field" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="new-password">
            Parola nouă
          </label>
          <input id="new-password" type="password" className="field" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-secondary" disabled={saving || !current || !next}>
          {saving && <Loader2 className="animate-spin" />}
          <KeyRound /> Schimbă parola
        </button>
      </div>
    </form>
  );
}

function DeleteAccount() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Alert
        tone="danger"
        title="Șterge contul"
        action={
          <button type="button" className="btn btn-danger btn-sm" onClick={() => setOpen(true)}>
            <Trash2 /> Șterge contul
          </button>
        }
      >
        Îți ștergem anunțurile, pozele, favoritele și căutările salvate. Conversațiile rămân la ceilalți, fără numele tău.
      </Alert>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form
          className="w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const { error } = await authClient.deleteUser({ password });
            setBusy(false);
            if (error) return toast.error(error.message || "Parola nu este corectă.");
            toast.success("Contul a fost șters. Ne pare rău că pleci!");
            navigate({ to: "/" });
          }}
        >
          <DialogCard
            icon={<Trash2 />}
            tone="danger"
            title="Ștergi contul definitiv?"
            className={sheetOnPhone}
            actions={
              <>
                <button type="submit" className="btn btn-danger btn-lg" disabled={busy || !password}>
                  {busy && <Loader2 className="animate-spin" />}
                  Da, șterge contul
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Renunță
                </button>
              </>
            }
          >
            <p>Nu se poate anula. Scrie parola ca să confirmi.</p>
            <input type="password" aria-label="Parola" placeholder="Parola" autoComplete="current-password" className="field mt-4 text-foreground" value={password} onChange={(e) => setPassword(e.target.value)} />
          </DialogCard>
        </form>
      </Modal>
    </>
  );
}

const LINKS = [
  { to: "/my-ads", label: "Anunțurile mele", icon: <Store /> },
  { to: "/messages", label: "Mesaje", icon: <MessageCircle /> },
  { to: "/favorites", label: "Favorite", icon: <Heart /> },
  { to: "/saved-searches", label: "Căutări salvate", icon: <BellRing /> },
  { to: "/notifications", label: "Notificări", icon: <Bell /> },
] as const;

function AccountPage() {
  const me = useMe();
  const navigate = useNavigate();
  if (me === undefined) return <Loader />;
  if (me === null) return null;
  const c = completeness(me);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <div className="flex items-center gap-4">
        <AvatarPicker me={me} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-heading font-semibold">{me.name || "Contul meu"}</h1>
          <p className="truncate text-sm text-muted-foreground">{me.email}</p>
          <Link to="/seller/$id" params={{ id: me.id }} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-ink hover:underline">
            <UserRound className="size-4" /> Vezi profilul public
          </Link>
        </div>
      </div>

      {c.missing.length > 0 && (
        <div className="flex items-center gap-5 rounded-3xl bg-linear-to-br from-promo to-promo-to p-5 text-promo-foreground sm:p-6">
          <ProgressRing value={(c.done / c.total) * 100} size={84} className="shrink-0 [&_.stroke-primary]:stroke-highlight [&_.stroke-surface-strong]:stroke-white/20">
            <span className="text-lg font-bold">
              {c.done}/{c.total}
            </span>
          </ProgressRing>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{c.missing.length === 1 ? "Mai ai un pas" : `Mai ai ${c.missing.length} pași`}</h2>
            <p className="text-sm text-promo-foreground/85">
              {capitalize(c.missing.slice(0, 2).join(" și "))}. Cumpărătorii răspund mai des vânzătorilor cu profil complet.
            </p>
          </div>
        </div>
      )}

      <nav className="panel grid divide-y divide-border p-2 sm:grid-cols-1">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="flex items-center gap-3 rounded-xl px-3 py-3 font-medium transition hover:bg-surface [&>svg:first-child]:size-5 [&>svg:first-child]:text-muted-foreground">
            {l.icon}
            <span className="flex-1">{l.label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </nav>

      <Section title="Profil" hint="Cum te văd cumpărătorii.">
        <ProfileForm me={me} />
      </Section>

      <Section title="Parolă">
        <PasswordForm />
      </Section>

      <button
        type="button"
        className="btn btn-secondary w-full"
        onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => navigate({ to: "/" }) } })}
      >
        <LogOut /> Ieși din cont
      </button>

      <DeleteAccount />
    </div>
  );
}
