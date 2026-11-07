import { Link, createFileRoute } from "@tanstack/react-router";

import { Block, StaticPage } from "@/components/static-page";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Termeni și condiții · Ofry.ro" }] }),
});

function TermsPage() {
  return (
    <StaticPage title="Termeni și condiții" updated="6 noiembrie 2026" intro="Regulile simple după care funcționează Ofry.">
      <Block title="1. Ce este Ofry">
        <p>
          Ofry.ro este o platformă de anunțuri unde persoanele fizice și firmele își pot publica gratuit anunțuri și pot vorbi cu cumpărătorii. Ofry nu
          vinde, nu cumpără și nu intermediază plata produselor din anunțuri. Contractul de vânzare se încheie direct între cumpărător și vânzător.
        </p>
      </Block>
      <Block title="2. Contul tău">
        <ul>
          <li>Trebuie să ai cel puțin 18 ani ca să îți faci cont.</li>
          <li>Ești responsabil pentru ce se întâmplă în contul tău. Păstrează parola doar pentru tine.</li>
          <li>Îți poți șterge contul oricând, din Contul meu.</li>
        </ul>
      </Block>
      <Block title="3. Ce poți publica">
        <ul>
          <li>Doar produse și servicii pe care ai dreptul să le vinzi, descrise corect, cu poze reale.</li>
          <li>Un produs într-un singur anunț, în categoria potrivită, cu prețul real.</li>
          <li>
            Nu sunt permise: arme și muniție, droguri, medicamente cu rețetă, animale protejate, produse contrafăcute, documente, conturi, conținut
            ofensator sau ilegal, anunțuri care cer plata în avans fără ca produsul să existe.
          </li>
        </ul>
      </Block>
      <Block title="4. Durata anunțurilor">
        <p>Un anunț rămâne activ 30 de zile. Îl poți reînnoi gratuit, îl poți dezactiva sau șterge oricând.</p>
      </Block>
      <Block title="5. Moderare">
        <p>
          Oricine poate raporta un anunț. Putem ascunde sau șterge anunțurile care încalcă aceste reguli și putem suspenda conturile care le încalcă în mod
          repetat.
        </p>
      </Block>
      <Block title="6. Răspundere">
        <p>
          Nu verificăm fiecare anunț înainte să apară și nu garantăm calitatea produselor sau buna-credință a utilizatorilor. Citește{" "}
          <Link to="/help" className="font-medium text-brand-ink underline">
            sfaturile de siguranță
          </Link>{" "}
          înainte de o tranzacție.
        </p>
      </Block>
      <Block title="7. Modificări">
        <p>Putem actualiza acești termeni. Data ultimei actualizări apare sus. Dacă schimbările sunt importante, te anunțăm în aplicație.</p>
      </Block>
    </StaticPage>
  );
}
