import { Link, createFileRoute } from "@tanstack/react-router";

import { Block, StaticPage } from "@/components/static-page";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Confidențialitate · Ofry.ro" }] }),
});

function PrivacyPage() {
  return (
    <StaticPage title="Politica de confidențialitate" updated="6 noiembrie 2026" intro="Ce date păstrăm, de ce, și cum le poți șterge.">
      <Block title="Ce date colectăm">
        <ul>
          <li>Contul: numele, adresa de email și parola (păstrată criptat).</li>
          <li>Profilul, dacă îl completezi: poza, telefonul, județul, localitatea și descrierea.</li>
          <li>Ce publici: anunțurile, pozele, mesajele, ofertele și recenziile.</li>
          <li>Ce salvezi: favoritele și căutările salvate.</li>
          <li>Statistici despre anunțuri: câte vizualizări are fiecare, pe zile, fără să știm cine le-a văzut.</li>
        </ul>
      </Block>
      <Block title="De ce le folosim">
        <ul>
          <li>Ca să funcționeze platforma: să îți publicăm anunțurile, să livrăm mesajele și notificările.</li>
          <li>Ca să ținem platforma sigură: verificarea anunțurilor raportate și prevenirea fraudelor.</li>
        </ul>
        <p>Nu vindem datele tale și nu le folosim pentru publicitate personalizată.</p>
      </Block>
      <Block title="Cine le vede">
        <ul>
          <li>Oricine vede anunțurile tale active, numele tău și profilul public.</li>
          <li>Telefonul din anunț e vizibil doar utilizatorilor autentificați.</li>
          <li>Mesajele le vedeți doar tu și persoana cu care vorbești.</li>
          <li>
            Folosim furnizori pentru găzduire și bază de date (Cloudflare, Convex), care prelucrează datele doar ca să ne ofere aceste servicii.
          </li>
        </ul>
      </Block>
      <Block title="Cât timp le păstrăm">
        <p>Cât timp ai cont. Când îți ștergi contul, ștergem anunțurile, pozele, favoritele, căutările salvate, notificările și profilul. Conversațiile rămân la cealaltă persoană, cu numele tău înlocuit cu „Cont șters”.</p>
      </Block>
      <Block title="Drepturile tale (GDPR)">
        <p>
          Ai dreptul să îți accesezi, corectezi, exporți sau ștergi datele și să te opui prelucrării. Pe cele mai multe le poți exercita direct din{" "}
          <Link to="/account" className="font-medium text-brand-ink underline">
            Contul meu
          </Link>
          . Pentru restul,{" "}
          <Link to="/contact" className="font-medium text-brand-ink underline">
            scrie-ne
          </Link>
          . Poți depune și o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).
        </p>
      </Block>
      <Block title="Cookie-uri și stocare locală">
        <p>
          Folosim doar ce e necesar ca să rămâi autentificat și câteva preferințe păstrate în browserul tău (tema, căutările recente, anunțurile văzute
          recent). Nu folosim cookie-uri de publicitate.
        </p>
      </Block>
    </StaticPage>
  );
}
