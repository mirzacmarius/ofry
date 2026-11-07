import { SafetyTip } from "@ofry/ui/components/ofry-feedback";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import { StaticPage } from "@/components/static-page";

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () => ({ meta: [{ title: "Ajutor · Ofry.ro" }, { name: "description", content: "Răspunsuri la întrebările frecvente despre anunțuri, oferte, mesaje și siguranță pe Ofry." }] }),
});

const FAQ: { q: string; a: React.ReactNode }[] = [
  { q: "Cât costă să public un anunț?", a: "Nimic. Publicarea, reînnoirea și mesajele sunt gratuite." },
  {
    q: "Cât timp rămâne anunțul activ?",
    a: "30 de zile. Cu 3 zile înainte primești o notificare și îl poți reînnoi gratuit din Anunțurile mele, pentru încă 30 de zile.",
  },
  {
    q: "Cum fac o ofertă?",
    a: "Dacă vânzătorul a marcat prețul ca negociabil, apasă „Fă o ofertă” pe pagina anunțului sau iconița cu monede din conversație. Vânzătorul o acceptă sau o refuză, iar tu primești o notificare.",
  },
  {
    q: "Cum aflu când apare ce caut?",
    a: (
      <>
        Caută ce te interesează, alege filtrele și apasă „Salvează căutarea”. Când apar anunțuri noi primești o notificare. Le găsești în{" "}
        <Link to="/saved-searches" className="font-medium text-brand-ink underline">
          Căutări salvate
        </Link>
        .
      </>
    ),
  },
  { q: "De ce văd un preț tăiat?", a: "Vânzătorul a redus prețul. Dacă ai salvat anunțul la favorite, ți-am trimis și o notificare." },
  {
    q: "Cum las o recenzie?",
    a: "După ce vânzătorul îți răspunde în mesaje, apare butonul „Evaluează” în conversație. Poți lăsa o singură recenzie pentru fiecare conversație.",
  },
  {
    q: "Am văzut un anunț suspect. Ce fac?",
    a: "Apasă „Raportează anunțul” în partea de jos a paginii anunțului. Vânzătorul nu află cine a raportat.",
  },
  {
    q: "Cum îmi șterg contul?",
    a: (
      <>
        Din{" "}
        <Link to="/account" className="font-medium text-brand-ink underline">
          Contul meu
        </Link>
        , jos de tot. Îți ștergem anunțurile, pozele, favoritele și căutările salvate.
      </>
    ),
  },
];

function HelpPage() {
  return (
    <StaticPage title="Ajutor" intro="Răspunsuri scurte la ce ne întreabă oamenii cel mai des.">
      <ul className="space-y-2">
        {FAQ.map((f) => (
          <li key={f.q}>
            <details className="group panel p-0 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center gap-3 p-4 font-semibold sm:p-5">
                <span className="flex-1">{f.q}</span>
                <ChevronDown className="size-5 text-muted-foreground transition group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4 leading-relaxed text-foreground/85 sm:px-5 sm:pb-5">{f.a}</div>
            </details>
          </li>
        ))}
      </ul>
      <SafetyTip
        tips={[
          "Nu plăti în avans și nu trimite coduri primite prin SMS.",
          "Vezi produsul înainte să plătești, într-un loc public.",
          "Vorbește prin mesajele Ofry, nu prin linkuri primite pe WhatsApp sau email.",
          "Ofry nu îți cere niciodată datele cardului ca să primești bani.",
        ]}
      />
      <p className="text-sm text-muted-foreground">
        N-ai găsit răspunsul?{" "}
        <Link to="/contact" className="font-medium text-brand-ink underline">
          Scrie-ne
        </Link>
        .
      </p>
    </StaticPage>
  );
}
