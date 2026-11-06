import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { DialogCard } from "@ofry/ui/components/ofry-feedback";
import { RatingInput } from "@ofry/ui/components/ofry-forms";
import { useMutation } from "convex/react";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { errorMessage } from "@/lib/format";

import { Modal, sheetOnPhone } from "./modal";

export function ReviewDialog({ open, onClose, conversationId, sellerName }: { open: boolean; onClose: () => void; conversationId: Id<"conversations">; sellerName: string }) {
  const create = useMutation(api.reviews.create);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  return (
    <Modal open={open} onClose={onClose}>
      <form
        className="w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!rating) return;
          setSending(true);
          try {
            await create({ conversationId, rating, text });
            toast.success("Mulțumim pentru recenzie!");
            onClose();
          } catch (err) {
            toast.error(errorMessage(err));
          } finally {
            setSending(false);
          }
        }}
      >
        <DialogCard
          icon={<Star />}
          title={`Cum a fost cu ${sellerName}?`}
          className={sheetOnPhone}
          actions={
            <>
              <button type="submit" className="btn btn-primary btn-lg" disabled={!rating || sending}>
                {sending && <Loader2 className="animate-spin" />}
                Publică recenzia
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Mai târziu
              </button>
            </>
          }
        >
          <p>Recenzia apare pe profilul vânzătorului, cu numele tău.</p>
          <RatingInput value={rating} onValueChange={setRating} className="mt-4 justify-center text-foreground" />
          <textarea
            className="field mt-4 min-h-24 text-left text-foreground"
            placeholder="A răspuns repede? Produsul a fost cum era descris? (opțional)"
            aria-label="Recenzie"
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </DialogCard>
      </form>
    </Modal>
  );
}
