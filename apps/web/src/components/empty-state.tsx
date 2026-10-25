import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-primary [&_svg]:size-6">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {children && <div className="max-w-sm text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
