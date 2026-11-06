import { EmptyArt } from "@ofry/ui/components/ofry-feedback";
import { cn } from "@ofry/ui/lib/utils";
import type { ReactNode } from "react";

/** Friendly empty state: pastel art, a title, one line of help and an optional action. */
export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface flex flex-col items-center px-6 py-12 text-center", className)}>
      <EmptyArt icon={icon} className="size-32" />
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      {children && <div className="mt-1 max-w-sm text-sm text-muted-foreground">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
