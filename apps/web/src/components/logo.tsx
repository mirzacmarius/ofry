import { cn } from "@ofry/ui/lib/utils";

/** Wordmark: "ofry" in ink with a bright green full stop. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline text-[1.625rem] leading-none font-extrabold tracking-[-0.04em]", className)}>
      ofry
      <span className="ml-px inline-block size-[0.3em] translate-y-[-0.02em] rounded-full bg-brand" aria-hidden />
      <span className="sr-only">.ro</span>
    </span>
  );
}
