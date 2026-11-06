import { placeholderSvg } from "@ofry/backend/convex/lib/placeholder";
import {
  ChatComposer,
  ConversationRow,
  DateDivider,
  MessageBubble,
  OfferBubble,
  QuickReplies,
  TypingBubble,
} from "@ofry/ui/components/ofry-chat";
import { Alert, DialogCard, EmptyArt, ProgressBar, ProgressRing, SafetyTip, SheetCard, ToastCard, TooltipBubble } from "@ofry/ui/components/ofry-feedback";
import { ChoiceTile, PhotoUploader, SearchSuggest } from "@ofry/ui/components/ofry-flows";
import { AffixField, Checkbox, PriceRange, RadioCards, RatingInput, Segmented, Stepper, Switch, Tabs } from "@ofry/ui/components/ofry-forms";
import {
  Avatar,
  AvatarStack,
  CollectionTile,
  Countdown,
  FairPriceMeter,
  KeyFacts,
  ListingRow,
  MapPreview,
  NotificationItem,
  Pagination,
  PlanCard,
  PriceTag,
  PromotedCard,
  SellerCard,
  StatTile,
  StepProgress,
  TrustBadge,
} from "@ofry/ui/components/ofry-market";
import {
  BellRing,
  ArrowLeft,
  BadgeCheck,
  Bath,
  Bell,
  BedDouble,
  Bike,
  Bookmark,
  Car,
  CheckCircle2,
  Eye,
  Gauge,
  Heart,
  Home,
  Layers,
  Mail,
  MessageCircle,
  MoreVertical,
  Package,
  Phone,
  Search,
  Shirt,
  SlidersHorizontal,
  Smartphone,
  Sofa,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Truck,
  Handshake,
  Ruler,
  CalendarDays,
  Fuel,
  Zap,
  Baby,
  PawPrint,
} from "lucide-react";
import { useState } from "react";

import { Block, PhoneFrame, Specimen, Stage } from "./kit";

function photo(category: string, subcategory: string, seed: number) {
  const svg = placeholderSvg({ title: "", category, subcategory, index: 0, total: 1, seed });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const P = {
  sofa: photo("casa-gradina", "mobila", 3),
  phone: photo("electronice", "telefoane", 4),
  bike: photo("sport-hobby", "biciclete", 5),
  car: photo("auto", "autoturisme", 6),
  flat: photo("imobiliare", "apartamente-vanzare", 7),
  lamp: photo("casa-gradina", "decoratiuni", 8),
  shoes: photo("moda", "incaltaminte", 9),
  stroller: photo("copii", "carucioare", 10),
};

export const CATALOG_SECTIONS = [
  ["formulare", "Formulare"],
  ["feedback", "Feedback"],
  ["anunturi", "Anunțuri"],
  ["vanzatori", "Vânzători"],
  ["chat", "Chat"],
  ["publicare", "Publicare"],
  ["cont", "Cont și statistici"],
  ["ecrane", "Ecrane"],
] as const;

/* ------------------------------------------------------------------ */

function FormsBlock() {
  const [condition, setCondition] = useState<"all" | "new" | "used">("all");
  return (
    <Block id="formulare" title="Formulare" description="Controale cu personalitate: comutatoare rotunde, carduri mari pentru alegeri, un slider de preț care arată unde e piața.">
      <div className="grid gap-8 lg:grid-cols-3">
        <Specimen label="Comutatoare">
          <div className="panel space-y-4 p-5">
            <Switch label="Alerte pentru căutare" description="Îți scriem când apare ceva nou" defaultChecked />
            <Switch label="Arată telefonul în anunț" />
            <Switch label="Doar anunțuri cu livrare" defaultChecked />
          </div>
        </Specimen>
        <Specimen label="Bife">
          <div className="panel p-5">
            <Checkbox label="Persoană fizică" count={8240} defaultChecked />
            <Checkbox label="Firmă" count={1312} />
            <Checkbox label="Cu poze" count={9120} defaultChecked />
            <Checkbox label="Livrare disponibilă" count={2470} />
          </div>
        </Specimen>
        <Specimen label="Segmentat, pas cu pas, notă">
          <div className="panel space-y-5 p-5">
            <Segmented
              value={condition}
              onValueChange={setCondition}
              options={[
                { value: "all", label: "Toate" },
                { value: "new", label: "Nou" },
                { value: "used", label: "Folosit" },
              ]}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Camere</span>
              <Stepper defaultValue={2} min={1} max={8} />
            </div>
            <RatingInput defaultValue={4} />
          </div>
        </Specimen>
        <Specimen label="Interval de preț cu histogramă" className="lg:col-span-2">
          <div className="panel p-5">
            <PriceRange min={0} max={5000} step={50} defaultValue={[600, 2800]} histogram={[2, 4, 9, 14, 22, 30, 26, 19, 15, 12, 9, 7, 6, 5, 3, 3, 2, 2, 1, 1]} />
          </div>
        </Specimen>
        <Specimen label="Câmpuri cu prefix și sufix">
          <div className="panel space-y-3 p-5">
            <AffixField start={<Tag />} end="lei" placeholder="Preț" inputMode="numeric" defaultValue="1.850" />
            <AffixField start={<Phone />} placeholder="07xx xxx xxx" />
            <AffixField start={<Mail />} placeholder="email@exemplu.ro" />
          </div>
        </Specimen>
        <Specimen label="Carduri de alegere" className="lg:col-span-2">
          <RadioCards
            columns={2}
            defaultValue="meet"
            options={[
              { value: "meet", label: "Predare personală", description: "Vă vedeți și verifici produsul pe loc", icon: <Handshake />, aside: "Gratuit" },
              { value: "courier", label: "Livrare prin curier", description: "1–2 zile lucrătoare, cu verificare la livrare", icon: <Truck />, aside: "19 lei" },
            ]}
          />
        </Specimen>
        <Specimen label="Tab-uri">
          <div className="panel p-5">
            <Tabs
              tabs={[
                { value: "details", label: "Detalii" },
                { value: "questions", label: "Întrebări", count: 6 },
                { value: "seller", label: "Vânzător" },
              ]}
            />
            <p className="pt-4 text-sm text-muted-foreground">Conținutul tab-ului activ apare aici.</p>
          </div>
        </Specimen>
      </div>
    </Block>
  );
}

/* ------------------------------------------------------------------ */

function FeedbackBlock() {
  return (
    <Block id="feedback" title="Feedback" description="Mesaje care se văd dar nu sperie: tonuri pastel, iconițe rotunde, dialoguri aerisite și foi care urcă de jos.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Alert tone="info" title="Anunțul tău e în verificare">
          Durează de obicei sub 10 minute. Îți trimitem o notificare când e live.
        </Alert>
        <Alert tone="success" title="Publicat! Anunțul e live" action={<span className="btn btn-primary btn-sm">Vezi anunțul</span>}>
          L-au văzut deja 12 oameni din Cluj.
        </Alert>
        <Alert tone="warning" title="Anunțul expiră în 3 zile" onDismiss={() => {}}>
          Reînnoiește-l gratuit ca să rămână în căutări.
        </Alert>
        <Alert tone="danger" title="Nu am putut încărca poza">
          Fișierul e mai mare de 10 MB. Încearcă o poză mai mică.
        </Alert>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Specimen label="Sfat de siguranță">
          <SafetyTip
            tips={["Nu plăti în avans și nu trimite coduri primite prin SMS.", "Vezi produsul înainte să plătești.", "Vorbește doar prin mesajele Ofry."]}
          />
        </Specimen>
        <Specimen label="Toast-uri">
          <Stage className="flex-col gap-3 p-5">
            <ToastCard icon={<Heart className="fill-current" />} title="Salvat la favorite" description="Îl găsești în Contul meu" action="Anulează" />
            <ToastCard icon={<CheckCircle2 />} title="Mesaj trimis către Andrei" />
            <ToastCard icon={<Zap />} title="Preț redus la 1.650 lei" description="iPhone 13, 128 GB" action="Vezi" />
          </Stage>
        </Specimen>
        <Specimen label="Progres">
          <div className="panel flex h-full flex-col gap-6 p-5">
            <ProgressBar value={72} label="Profil completat" hint="5 din 7 pași" />
            <ProgressBar value={35} label="Se încarcă pozele" />
            <div className="flex items-center gap-4">
              <ProgressRing value={86} />
              <div>
                <div className="font-semibold">Anunț foarte bun</div>
                <div className="text-sm text-muted-foreground">Adaugă încă o poză pentru 100%.</div>
              </div>
            </div>
          </div>
        </Specimen>
        <Specimen label="Dialog">
          <Stage className="min-h-[320px]">
            <DialogCard
              tone="danger"
              icon={<Trash2 />}
              title="Ștergi anunțul?"
              actions={
                <>
                  <span className="btn bg-destructive text-white hover:bg-destructive/90">Da, șterge</span>
                  <span className="btn btn-ghost">Renunță</span>
                </>
              }
            >
              Nu îl mai poți recupera. Dacă l-ai vândut, marchează-l mai bine ca vândut.
            </DialogCard>
          </Stage>
        </Specimen>
        <Specimen label="Foaie de jos (telefon)">
          <Stage className="min-h-[320px] items-end p-0 px-4 pt-10">
            <SheetCard title="Sortează după" footer={<span className="btn btn-primary w-full">Aplică</span>}>
              <RadioCards
                defaultValue="new"
                options={[
                  { value: "new", label: "Cele mai noi" },
                  { value: "cheap", label: "Cele mai ieftine" },
                  { value: "near", label: "Cele mai apropiate" },
                ]}
                className="[&_label]:p-3"
              />
            </SheetCard>
          </Stage>
        </Specimen>
        <Specimen label="Stări goale și indicii">
          <div className="panel flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <EmptyArt icon={<Bookmark />} />
            <div className="font-semibold">Nicio căutare salvată</div>
            <p className="max-w-xs text-sm text-muted-foreground">Salvează o căutare și te anunțăm primii când apare ceva nou.</p>
            <div className="mt-2 flex items-center gap-3">
              <TooltipBubble>Salvează căutarea</TooltipBubble>
              <span className="btn btn-secondary btn-icon">
                <Bookmark />
              </span>
            </div>
          </div>
        </Specimen>
      </div>
    </Block>
  );
}

/* ------------------------------------------------------------------ */

function ListingsBlock() {
  return (
    <Block id="anunturi" title="Anunțuri, prețuri, colecții" description="Variante de card pentru fiecare context, prețuri care spun povestea (reduceri, negociere, analiză de piață) și colecții colorate.">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Specimen label="Anunț promovat">
          <PromotedCard
            image={P.flat}
            title="Apartament 3 camere, Grădini Mănăștur"
            meta="Cluj-Napoca · acum 1 oră"
            price={489000}
            facts={[
              { icon: <BedDouble />, label: "3 camere" },
              { icon: <Bath />, label: "2 băi" },
              { icon: <Ruler />, label: "72 m²" },
              { icon: <Layers />, label: "Etaj 4/8" },
            ]}
          />
        </Specimen>
        <div className="space-y-6">
          <Specimen label="Rânduri de listă">
            <div className="panel divide-y divide-border px-4">
              <ListingRow
                className="py-3"
                image={P.phone}
                title="iPhone 13, 128 GB, baterie 89%"
                price={1650}
                meta="București · acum 5 ore"
                badges={<span className="badge badge-highlight h-6 px-2">−11%</span>}
                trailing={
                  <span className="icon-btn bg-brand-soft text-brand-ink">
                    <Heart className="fill-current" />
                  </span>
                }
              />
              <ListingRow
                className="py-3"
                image={P.bike}
                title="Bicicletă de oraș, cadru aluminiu"
                price={0}
                meta="Iași · ieri"
                badges={<span className="badge badge-highlight h-6 px-2">Gratuit</span>}
                trailing={
                  <span className="icon-btn">
                    <Heart />
                  </span>
                }
              />
              <ListingRow
                className="py-3"
                image={P.lamp}
                title="Lampă de birou retro, alamă"
                price={180}
                meta="Timișoara · acum 3 zile"
                badges={<Countdown hoursLeft={9} className="h-6 px-2" />}
                trailing={
                  <span className="btn btn-ghost btn-icon btn-sm">
                    <MoreVertical />
                  </span>
                }
              />
            </div>
          </Specimen>
          <Specimen label="Prețuri">
            <div className="panel space-y-3 p-5">
              <PriceTag price={1650} oldPrice={1850} size="lg" />
              <PriceTag price={38500} negotiable />
              <PriceTag price={0} size="sm" />
            </div>
          </Specimen>
        </div>
        <Specimen label="Analiză de preț">
          <div className="space-y-3">
            <FairPriceMeter price={1650} low={1500} high={1900} />
            <FairPriceMeter price={1200} low={1500} high={1900} />
          </div>
        </Specimen>
        <Specimen label="Date cheie">
          <KeyFacts
            className="sm:grid-cols-2"
            facts={[
              { icon: <CalendarDays />, label: "An", value: "2019" },
              { icon: <Gauge />, label: "Kilometraj", value: "64.000 km" },
              { icon: <Fuel />, label: "Combustibil", value: "Benzină" },
              { icon: <Car />, label: "Caroserie", value: "Sedan" },
            ]}
          />
        </Specimen>
        <Specimen label="Colecții" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <CollectionTile tint="periwinkle" label="Te muți?" title="Totul pentru casă nouă" count={3480} art={<Sofa className="size-16 opacity-80" strokeWidth={1.25} />} />
            <CollectionTile tint="butter" label="Sub 50 lei" title="Chilipiruri de weekend" count={1290} art={<Tag className="size-14 opacity-80" strokeWidth={1.25} />} />
            <CollectionTile tint="violet" label="Studenți" title="Start de an universitar" count={860} art={<Smartphone className="size-14 opacity-80" strokeWidth={1.25} />} />
            <CollectionTile tint="mint" label="Sezon" title="Pe două roți" count={540} art={<Bike className="size-16 opacity-80" strokeWidth={1.25} />} />
          </div>
        </Specimen>
        <Specimen label="Hartă">
          <MapPreview place="Cluj-Napoca, Mănăștur" detail="La 2,4 km de tine" />
        </Specimen>
        <Specimen label="Paginare și încarcă mai multe">
          <div className="space-y-3">
            <div className="panel flex items-center justify-center p-5">
              <Pagination page={4} pages={12} />
            </div>
            <div className="panel p-5 text-center">
              <p className="text-sm text-muted-foreground">
                Ai văzut <b className="font-semibold text-foreground">48</b> din 1.240 de anunțuri
              </p>
              <div className="mx-auto mt-3 h-1.5 max-w-56 overflow-hidden rounded-full bg-surface-strong">
                <div className="h-full w-[4%] rounded-full bg-primary" />
              </div>
              <button type="button" className="btn btn-secondary mt-4">
                Încarcă mai multe
              </button>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-brand-soft p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BellRing className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">Nu ai găsit ce cauți?</div>
                <div className="text-xs text-muted-foreground">Te anunțăm când apare un „iPhone 13” sub 1.800 lei.</div>
              </div>
              <button type="button" className="btn btn-primary btn-sm shrink-0">
                Salvează
              </button>
            </div>
          </div>
        </Specimen>
      </div>
    </Block>
  );
}

/* ------------------------------------------------------------------ */

function SellersBlock() {
  return (
    <Block id="vanzatori" title="Vânzători și încredere" description="Fețe prietenoase pentru oameni: avatare pastel generate din nume, insigne de verificare și o carte de vizită care răspunde la „pot avea încredere?”.">
      <div className="grid gap-6 lg:grid-cols-3">
        <SellerCard
          name="Ioana Popescu"
          memberSince="2021"
          rating={4.9}
          reviews={128}
          responseTime="sub 1 oră"
          activeListings={14}
          online
          verified
          badges={
            <>
              <TrustBadge icon={<Phone />}>Telefon verificat</TrustBadge>
              <TrustBadge icon={<BadgeCheck />}>Identitate</TrustBadge>
              <TrustBadge icon={<Sparkles />}>Top vânzător</TrustBadge>
            </>
          }
          actions={
            <>
              <span className="btn btn-primary flex-1">
                <MessageCircle /> Mesaj
              </span>
              <span className="btn btn-brand-outline btn-icon">
                <Phone />
              </span>
            </>
          }
        />
        <Specimen label="Avatare">
          <div className="panel space-y-5 p-5">
            <div className="flex items-end gap-3">
              <Avatar name="Andrei Ionescu" size="xl" verified />
              <Avatar name="Maria Dumitru" size="lg" online />
              <Avatar name="Radu Stan" size="md" />
              <Avatar name="Elena Matei" size="sm" />
              <Avatar name="Victor Pop" size="xs" />
            </div>
            <div className="flex items-center gap-3">
              <AvatarStack names={["Ana B", "Mihai C", "Dana E", "Sorin F", "Irina G", "Paul H", "Lia I"]} />
              <span className="text-sm text-muted-foreground">7 oameni urmăresc acest anunț</span>
            </div>
          </div>
        </Specimen>
        <Specimen label="Recenzie">
          <div className="panel p-5">
            <div className="flex items-center gap-3">
              <Avatar name="Cristina Lazăr" size="sm" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Cristina Lazăr</div>
                <div className="text-xs text-muted-foreground">a cumpărat Fotoliu tapițat · 2 săptămâni</div>
              </div>
            </div>
            <div className="mt-3 flex gap-0.5 text-rating">{"★★★★★"}</div>
            <p className="mt-2 text-sm text-foreground/85">„Exact ca în poze, Ioana a fost super de treabă și m-a ajutat să-l duc la mașină. Recomand!”</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="badge">Comunicare rapidă</span>
              <span className="badge">Ca în descriere</span>
            </div>
          </div>
        </Specimen>
      </div>
    </Block>
  );
}

/* ------------------------------------------------------------------ */

function ChatBlock() {
  return (
    <Block id="chat" title="Chat și oferte" description="Conversații calde: bule violet pentru tine, gri pentru celălalt, oferte de preț ca niște bilete și răspunsuri rapide pentru începuturi ușoare.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Specimen label="Inbox">
          <div className="panel space-y-1 p-2">
            <div className="flex items-center justify-between px-3 pt-2 pb-1">
              <span className="text-lg font-semibold">Mesaje</span>
              <span className="badge badge-brand">3 noi</span>
            </div>
            <Segmented
              options={[
                { value: "all", label: "Toate" },
                { value: "buy", label: "Cumpăr" },
                { value: "sell", label: "Vând" },
              ]}
              defaultValue="all"
              size="sm"
              className="mx-2 mb-2"
            />
            <ConversationRow name="Andrei Ionescu" listing="iPhone 13, 128 GB" last="Pot să trec diseară după 6?" time="14:32" unread={2} online thumb={P.phone} />
            <ConversationRow name="Maria Dumitru" listing="Fotoliu tapițat" last="" typing time="13:05" thumb={P.sofa} active />
            <ConversationRow name="Radu Stan" listing="Bicicletă de oraș" last="Mulțumesc, o iau mâine!" time="ieri" thumb={P.bike} />
            <ConversationRow name="Elena Marin" listing="Apartament 3 camere" last="Ofertă: 482.000 lei" time="ieri" unread={1} thumb={P.flat} />
            <ConversationRow name="Victor Pop" listing="Dacia Logan 1.0 SCe" last="Ai trimis: Se poate vedea sâmbătă?" time="lun." thumb={P.car} />
            <ConversationRow name="Sorin Florea" listing="Cărucior 3 în 1" last="Mersi, l-am luat deja." time="12 oct." online thumb={P.stroller} />
          </div>
        </Specimen>
        <Specimen label="Conversație">
          <div className="panel flex flex-col gap-3 p-4">
            <div className="surface flex items-center gap-3 rounded-2xl p-2 pr-3">
              <img src={P.sofa} alt="" className="size-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">Fotoliu tapițat, verde, ca nou</div>
                <div className="text-sm font-bold text-price">450 lei</div>
              </div>
              <span className="btn btn-primary btn-sm">Fă o ofertă</span>
            </div>
            <DateDivider>Azi</DateDivider>
            <MessageBubble time="12:58">Bună! Mai e disponibil fotoliul?</MessageBubble>
            <MessageBubble mine time="13:01" status="read">
              Da, e disponibil. Îl poți vedea oricând după-amiaza 🙂
            </MessageBubble>
            <OfferBubble amount={400} listPrice={450} actions={<><span className="btn btn-primary btn-sm">Accept</span><span className="btn btn-secondary btn-sm">Refuz</span></>} />
            <MessageBubble mine time="13:04" status="sent">
              Hai să zicem 420 și e al tău.
            </MessageBubble>
            <TypingBubble name="Maria" />
            <QuickReplies replies={["Mai e disponibil?", "Care e prețul final?", "Unde se poate ridica?", "Faceți livrare?"]} />
            <ChatComposer />
          </div>
        </Specimen>
      </div>
    </Block>
  );
}

/* ------------------------------------------------------------------ */

function PostingBlock() {
  const [cat, setCat] = useState("casa");
  return (
    <Block id="publicare" title="Publicare și căutare" description="Fluxul de adăugare anunț în patru pași, cu poze care se rearanjează, categorii pastel de ales și sugestii de căutare care ghicesc ce vrei.">
      <div className="panel p-5">
        <StepProgress steps={["Categorie", "Detalii", "Poze", "Preț"]} current={2} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Specimen label="Încărcare poze">
          <div className="panel p-5">
            <PhotoUploader photos={[P.sofa, P.lamp, P.flat]} uploading={1} />
          </div>
        </Specimen>
        <Specimen label="Alege categoria">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["imob", "Imobiliare", <Home key="i" />, "lavender"],
              ["auto", "Auto", <Car key="a" />, "slate"],
              ["elec", "Electronice", <Smartphone key="e" />, "periwinkle"],
              ["casa", "Casă și grădină", <Sofa key="c" />, "butter"],
              ["moda", "Modă", <Shirt key="m" />, "pink"],
              ["copii", "Copii", <Baby key="b" />, "peach"],
              ["sport", "Sport", <Bike key="s" />, "mint"],
              ["anim", "Animale", <PawPrint key="p" />, "butter"],
              ["alte", "Altele", <Package key="o" />, "sky"],
            ].map(([id, label, icon, tint]) => (
              <ChoiceTile key={id as string} icon={icon} label={label as string} tint={tint as string} selected={cat === id} onSelect={() => setCat(id as string)} />
            ))}
          </div>
        </Specimen>
        <Specimen label="Sugestii de căutare" className="lg:col-span-2">
          <div className="grid gap-6 lg:grid-cols-2">
            <SearchSuggest
              query="iph"
              matches={[
                { label: "iphone 13", category: "Telefoane", count: 1284 },
                { label: "iphone 15 pro", category: "Telefoane", count: 642 },
                { label: "iphone husă", category: "Accesorii", count: 318 },
              ]}
            />
            <SearchSuggest recent={["bicicletă copii", "apartament 2 camere Cluj"]} trending={["PS5", "Cărucior", "Rochie de mireasă", "Golf 7", "Canapea extensibilă"]} />
          </div>
        </Specimen>
      </div>
    </Block>
  );
}

/* ------------------------------------------------------------------ */

function AccountBlock() {
  return (
    <Block id="cont" title="Cont, statistici, notificări" description="Ce vede vânzătorul despre anunțurile lui și cum îl ajutăm să vândă mai repede: grafice mici, notificări clare, pachete de promovare.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Eye />} label="Vizualizări" value="1.248" delta={18} data={[12, 18, 15, 22, 30, 26, 38, 41, 37, 52]} />
        <StatTile icon={<Heart />} label="Salvări" value="86" delta={9} data={[3, 4, 4, 6, 5, 7, 9, 8, 10, 12]} />
        <StatTile icon={<MessageCircle />} label="Mesaje" value="23" delta={-4} data={[5, 6, 4, 7, 5, 4, 6, 3, 4, 3]} />
        <StatTile icon={<Store />} label="Vândute" value="7" data={[0, 1, 1, 1, 2, 3, 3, 4, 6, 7]} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Specimen label="Notificări">
          <div className="panel space-y-1 p-2">
            <NotificationItem icon={<MessageCircle />} title="Andrei" body="ți-a trimis un mesaj despre iPhone 13" time="acum 2 min" unread thumb={P.phone} />
            <NotificationItem icon={<Zap />} tone="highlight" title="Preț redus" body="la un anunț salvat: Fotoliu tapițat, acum 400 lei" time="acum 1 oră" unread thumb={P.sofa} />
            <NotificationItem icon={<Search />} tone="mint" title="12 anunțuri noi" body="pentru „bicicletă copii” în Iași" time="azi, 09:00" />
            <NotificationItem icon={<Bell />} tone="peach" title="Anunțul expiră" body="Lampă de birou retro expiră mâine" time="ieri" />
          </div>
        </Specimen>
        <Specimen label="Promovează anunțul">
          <div className="grid gap-4 pt-3 sm:grid-cols-3">
            <PlanCard name="Reînnoire" price={9} period="o dată" features={["Urcă din nou în top", "Ideal după o reducere de preț"]} cta={<span className="btn btn-secondary w-full">Alege</span>} />
            <PlanCard
              popular
              name="Evidențiat"
              price={29}
              period="7 zile"
              features={["Chenar și insignă Promovat", "Primele locuri în categorie", "De 4× mai multe vizualizări"]}
              cta={<span className="btn btn-inverse w-full">Promovează</span>}
            />
            <PlanCard name="Top oraș" price={59} period="14 zile" features={["Pe prima pagină în orașul tău", "Inclus în newsletter", "Raport săptămânal"]} cta={<span className="btn btn-secondary w-full">Alege</span>} />
          </div>
        </Specimen>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Specimen label="Căutare salvată">
          <div className="panel p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--ofry-tint-mint)] text-neutral-900">
                <Bike className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">bicicletă copii</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="badge">Iași</span>
                  <span className="badge">Sub 400 lei</span>
                  <span className="badge">Folosit</span>
                </div>
              </div>
              <span className="badge badge-highlight">12 noi</span>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <Switch label="Notificări instant" description="Push și email, cel mult o dată pe oră" defaultChecked />
            </div>
          </div>
        </Specimen>
        <Specimen label="Completează profilul">
          <div className="flex h-full items-center gap-5 rounded-3xl bg-linear-to-br from-promo to-promo-to p-5 text-promo-foreground">
            <ProgressRing value={71} className="[&_circle:first-child]:stroke-white/20 [&_circle:last-child]:stroke-highlight">
              <span className="text-lg font-bold">5/7</span>
            </ProgressRing>
            <div>
              <div className="text-lg font-semibold">Mai ai 2 pași</div>
              <p className="text-sm text-promo-foreground/90">Adaugă o poză de profil și verifică telefonul. Cumpărătorii răspund de 3× mai des.</p>
              <span className="btn btn-inverse btn-sm mt-3">Continuă</span>
            </div>
          </div>
        </Specimen>
      </div>
    </Block>
  );
}

/* ------------------------------------------------------------------ */

function ScreensBlock() {
  return (
    <Block id="ecrane" title="Ecrane pe telefon" description="Piesele de mai sus puse cap la cap: filtre într-o foaie, o conversație cu ofertă și pagina unui anunț promovat.">
      <div className="flex gap-8 overflow-x-auto pb-4">
        <PhoneFrame>
          <div className="flex items-center gap-2 px-4 pt-3">
            <ArrowLeft className="size-5" />
            <div className="flex-1 text-center font-semibold">Filtre</div>
            <span className="text-sm font-semibold text-brand-ink">Resetează</span>
          </div>
          <div className="flex-1 space-y-5 overflow-hidden px-4 pt-5">
            <div>
              <div className="mb-2 text-sm font-semibold">Stare</div>
              <Segmented options={[{ value: "a", label: "Toate" }, { value: "n", label: "Nou" }, { value: "u", label: "Folosit" }]} defaultValue="u" size="sm" className="w-full" />
            </div>
            <div>
              <div className="mb-1 text-sm font-semibold">Preț</div>
              <PriceRange min={0} max={3000} step={50} defaultValue={[200, 1600]} histogram={[3, 6, 10, 16, 20, 18, 12, 9, 6, 4, 3, 2]} />
            </div>
            <div className="space-y-3">
              <Switch label="Doar cu livrare" defaultChecked />
              <Switch label="Vânzători verificați" />
            </div>
          </div>
          <div className="border-t border-border p-3">
            <span className="btn btn-primary w-full">
              <SlidersHorizontal /> Arată 1.284 anunțuri
            </span>
          </div>
        </PhoneFrame>

        <PhoneFrame>
          <div className="flex items-center gap-3 border-b border-border px-4 pt-3 pb-3">
            <ArrowLeft className="size-5" />
            <Avatar name="Maria Dumitru" size="sm" online />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">Maria Dumitru</div>
              <div className="text-[11px] text-emerald-600">online</div>
            </div>
            <Phone className="size-5 text-brand-ink" />
          </div>
          <div className="flex-1 space-y-2.5 overflow-hidden px-3 pt-3">
            <div className="surface flex items-center gap-2 rounded-xl p-1.5 pr-2">
              <img src={P.sofa} alt="" className="size-9 rounded-lg object-cover" />
              <div className="min-w-0 flex-1 truncate text-xs font-semibold">Fotoliu tapițat · 450 lei</div>
            </div>
            <MessageBubble time="12:58">Bună! Mai e disponibil?</MessageBubble>
            <MessageBubble mine time="13:01" status="read">
              Da! Poți trece azi.
            </MessageBubble>
            <OfferBubble mine amount={400} listPrice={450} status="accepted" />
            <MessageBubble time="13:06">Super, ne vedem la 6 🙌</MessageBubble>
          </div>
          <div className="space-y-2 border-t border-border p-3">
            <QuickReplies replies={["Ne vedem!", "Trimite locația"]} />
            <ChatComposer />
          </div>
        </PhoneFrame>

        <PhoneFrame>
          <div className="relative">
            <div className="surface m-3 aspect-square overflow-hidden rounded-3xl">
              <img src={P.flat} alt="" className="size-full object-cover" />
            </div>
            <span className="icon-btn absolute top-6 left-6">
              <ArrowLeft />
            </span>
            <span className="icon-btn absolute top-6 right-6 text-primary">
              <Heart className="fill-current" />
            </span>
            <span className="badge badge-highlight absolute bottom-6 left-6">Promovat</span>
          </div>
          <div className="flex-1 space-y-3 overflow-hidden px-4">
            <div className="text-lg leading-snug font-semibold">Apartament 3 camere, Grădini Mănăștur</div>
            <PriceTag price={489000} oldPrice={515000} />
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              {[
                ["3", "camere"],
                ["72", "m²"],
                ["4/8", "etaj"],
              ].map(([v, l]) => (
                <div key={l} className="surface rounded-xl py-2">
                  <div className="font-bold">{v}</div>
                  <div className="text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Avatar name="Ioana Popescu" size="sm" verified />
              <div className="text-xs">
                <div className="font-semibold">Ioana Popescu</div>
                <div className="text-muted-foreground">★ 4,9 · răspunde sub 1 oră</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 border-t border-border p-3">
            <span className="btn btn-primary flex-1 px-2">
              <MessageCircle /> Mesaj
            </span>
            <span className="btn btn-brand-outline flex-1 px-2">
              <Phone /> Sună
            </span>
          </div>
        </PhoneFrame>
      </div>
    </Block>
  );
}

export function CatalogSections() {
  return (
    <>
      <FormsBlock />
      <FeedbackBlock />
      <ListingsBlock />
      <SellersBlock />
      <ChatBlock />
      <PostingBlock />
      <AccountBlock />
      <ScreensBlock />
    </>
  );
}
