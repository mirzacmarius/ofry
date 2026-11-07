import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { DialogCard } from "@ofry/ui/components/ofry-feedback";
import { AffixField } from "@ofry/ui/components/ofry-forms";
import { cn } from "@ofry/ui/lib/utils";
import { useMutation } from "convex/react";
import { HandCoins, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { errorMessage, formatPrice } from "@/lib/format";

import { Modal, sheetOnPhone } from "./modal";

const DISCOUNTS = [5, 10, 15];

/** Ask the seller for a lower price. Calls onSent with the conversation id. */
export function OfferDialog({
  open,
  onClose,
  listingId,
  price,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  listingId: Id<"listings">;
  price: number;
  onSent?: (conversationId: Id<"conversations">) => void;
}) {
  const makeOffer = useMutation(api.messages.makeOffer);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const amount = Number(value.replace(/\s|\./g, ""));
  const valid = Number.isFinite(amount) && amount > 0 && amount < price;
  const suggestion = (pct: number) => Math.max(1, Math.round((price * (100 - pct)) / 100 / 10) * 10);

  const submit = async () => {
    if (!valid) return;
    setSending(true);
    try {
      const conversationId = await makeOffer({ listingId, amount });
      toast.success("Oferta a fost trimisă");
      setValue("");
      onClose();
      onSent?.(conversationId);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <DialogCard
          icon={<HandCoins />}
          title="Fă o ofertă"
          className={sheetOnPhone}
          actions={
            <>
              <button type="submit" className="btn btn-primary btn-lg" disabled={!valid || sending}>
                {sending && <Loader2 className="animate-spin" />}
                Trimite oferta{valid ? ` de ${formatPrice(amount)}` : ""}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Renunță
              </button>
            </>
          }
        >
          <p>
            Prețul afișat e <strong className="text-foreground">{formatPrice(price)}</strong>. Vânzătorul poate accepta sau refuza din mesaje.
          </p>
          <AffixField
            end="lei"
            inputMode="numeric"
            aria-label="Suma oferită"
            placeholder="Suma ta"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-4 h-14 text-left"
            inputClassName="text-lg font-semibold text-foreground"
          />
          {value && !valid && <p className="mt-1.5 text-left text-xs text-destructive">Oferta trebuie să fie sub prețul afișat.</p>}
          <div className="mt-3 flex justify-center gap-2">
            {DISCOUNTS.map((pct) => {
              const s = suggestion(pct);
              return (
                <button key={pct} type="button" className={cn("chip chip-sm", amount === s && "chip-active")} onClick={() => setValue(String(s))}>
                  −{pct}% · {formatPrice(s)}
                </button>
              );
            })}
          </div>
        </DialogCard>
      </form>
    </Modal>
  );
}
