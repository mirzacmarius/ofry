import { cn } from "@ofry/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

/**
 * Grey, borderless search field with a leading magnifier.
 * `size="lg"` is the hero version used at the top of the home page.
 */
export function SearchBar({
  className,
  size = "md",
  placeholder = "Caută pe Ofry",
}: {
  className?: string;
  size?: "md" | "lg";
  placeholder?: string;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/search", search: { q: q.trim() || undefined } });
      }}
    >
      <div className="relative">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            size === "lg" ? "left-4 size-5" : "left-3.5 size-[1.125rem]",
          )}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label="Caută anunțuri"
          enterKeyHint="search"
          className={cn("field", size === "lg" ? "h-14 rounded-xl pl-12 text-base" : "pl-10")}
        />
      </div>
    </form>
  );
}
