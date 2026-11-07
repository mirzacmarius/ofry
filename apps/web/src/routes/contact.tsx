import { api } from "@ofry/backend/convex/_generated/api";
import { Alert } from "@ofry/ui/components/ofry-feedback";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StaticPage } from "@/components/static-page";
import { errorMessage } from "@/lib/format";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({ meta: [{ title: "Contact · Ofry.ro" }] }),
});

const TOPICS = ["Întrebare", "Problemă tehnică", "Anunț sau utilizator suspect", "Datele mele (GDPR)", "Altceva"];

function ContactPage() {
  const me = useQuery(api.auth.getCurrentUser);
  const send = useMutation(api.contact.send);
  const [v, setV] = useState({ name: "", email: "", topic: TOPICS[0]!, body: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const name = v.name || me?.name || "";
  const email = v.email || me?.email || "";

  return (
    <StaticPage title="Contact" intro="Răspundem de obicei în 1-2 zile lucrătoare.">
      <p className="text-sm text-muted-foreground">
        Pentru un anunț anume, cel mai rapid e butonul „Raportează anunțul” de pe pagina lui. Întrebările frecvente sunt în{" "}
        <Link to="/help" className="font-medium text-brand-ink underline">
          Ajutor
        </Link>
        .
      </p>
      {sent ? (
        <Alert tone="success" title="Mesaj trimis">
          Mulțumim! Îți răspundem la {email}.
        </Alert>
      ) : (
        <form
          className="panel space-y-4 p-5 sm:p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setSending(true);
            try {
              await send({ name, email, topic: v.topic, body: v.body });
              setSent(true);
            } catch (err) {
              toast.error(errorMessage(err));
            } finally {
              setSending(false);
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-name">
                Nume
              </label>
              <input id="c-name" className="field" autoComplete="name" required value={name} onChange={(e) => setV({ ...v, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="c-email">
                Email
              </label>
              <input id="c-email" type="email" className="field" autoComplete="email" required value={email} onChange={(e) => setV({ ...v, email: e.target.value })} />
            </div>
          </div>
          <div>
            <span className="label">Despre ce e vorba?</span>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button key={t} type="button" className="chip chip-sm" aria-pressed={v.topic === t} onClick={() => setV({ ...v, topic: t })}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="c-body">
              Mesaj
            </label>
            <textarea id="c-body" className="field" rows={6} required minLength={10} maxLength={5000} value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? <Loader2 className="animate-spin" /> : <Send />}
              Trimite mesajul
            </button>
          </div>
        </form>
      )}
    </StaticPage>
  );
}
