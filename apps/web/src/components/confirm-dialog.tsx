import { DialogCard } from "@ofry/ui/components/ofry-feedback";
import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Modal, sheetOnPhone } from "./modal";

/** Yes/no question in a DialogCard, replacing window.confirm. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  icon,
  title,
  children,
  confirmLabel,
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<unknown> | void;
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose}>
      <DialogCard
        icon={icon}
        tone={danger ? "danger" : "brand"}
        title={title}
        className={sheetOnPhone}
        actions={
          <>
            <button
              type="button"
              className={danger ? "btn btn-danger btn-lg" : "btn btn-primary btn-lg"}
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                  onClose();
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy && <Loader2 className="animate-spin" />}
              {confirmLabel}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Renunță
            </button>
          </>
        }
      >
        {children}
      </DialogCard>
    </Modal>
  );
}
