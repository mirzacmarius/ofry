import { cn } from "@ofry/ui/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Overlay for DialogCard and similar surfaces. Sits at the bottom on phones
 * (like a sheet) and in the middle on bigger screens. Closes on Escape and on
 * a click outside.
 */
export function Modal({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the first field or button inside.
    ref.current?.querySelector<HTMLElement>("input, textarea, select, button:not([data-modal-skip])")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={ref} className={cn("flex max-h-[92dvh] w-full justify-center overflow-y-auto sm:w-auto", className)}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** Rounded-top on phones so a dialog reads as a sheet there. */
export const sheetOnPhone = "max-w-none rounded-b-none pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-sm sm:rounded-b-3xl";
