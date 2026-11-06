import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { REPORT_REASONS, type ReportReason } from "@ofry/backend/convex/lib/constants";
import { DialogCard } from "@ofry/ui/components/ofry-feedback";
import { RadioCards } from "@ofry/ui/components/ofry-forms";
import { useMutation } from "convex/react";
import { Flag, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { errorMessage } from "@/lib/format";

import { Modal, sheetOnPhone } from "./modal";

export function ReportDialog({ open, onClose, listingId }: { open: boolean; onClose: () => void; listingId: Id<"listings"> }) {
  const report = useMutation(api.reports.create);
  const [reason, setReason] = useState<ReportReason>();
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <Modal open={open} onClose={onClose}>
      <form
        className="w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!reason) return;
          setSending(true);
          try {
            await report({ listingId, reason, details });
            toast.success("Mulțumim! Verificăm anunțul cât mai repede.");
            onClose();
          } catch (err) {
            toast.error(errorMessage(err));
          } finally {
            setSending(false);
          }
        }}
      >
        <DialogCard
          icon={<Flag />}
          tone="danger"
          title="Raportează anunțul"
          className={`${sheetOnPhone} sm:max-w-md`}
          actions={
            <>
              <button type="submit" className="btn btn-danger btn-lg" disabled={!reason || sending}>
                {sending && <Loader2 className="animate-spin" />}
                Trimite raportul
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Renunță
              </button>
            </>
          }
        >
          <p>Vânzătorul nu află cine a raportat.</p>
          <RadioCards<ReportReason>
            className="mt-4 text-left text-foreground"
            name="reason"
            value={reason}
            onValueChange={setReason}
            options={REPORT_REASONS.map((r) => ({ value: r.value, label: r.label, description: r.description }))}
          />
          <textarea
            className="field mt-3 min-h-20 text-left text-foreground"
            placeholder={reason === "other" ? "Ce s-a întâmplat?" : "Detalii (opțional)"}
            aria-label="Detalii"
            maxLength={1000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </DialogCard>
      </form>
    </Modal>
  );
}
