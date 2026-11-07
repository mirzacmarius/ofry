import { api } from "@ofry/backend/convex/_generated/api";
import { SearchSuggest } from "@ofry/ui/components/ofry-flows";
import { cn } from "@ofry/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { categoryName } from "@/lib/format";
import { recentSearches, rememberSearch } from "@/lib/local-history";

/**
 * Grey, borderless search field with a leading magnifier, and a dropdown with
 * recent searches and matching categories while typing.
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
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setTyped(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);
  const suggestions = useQuery(api.listings.suggest, open && typed.length >= 2 ? { q: typed } : "skip");

  const go = (text: string, category?: string) => {
    rememberSearch(text);
    setOpen(false);
    navigate({ to: "/search", search: { q: text.trim() || undefined, category } });
  };

  const recent = open ? recentSearches().filter((r) => !q || r.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5) : [];
  const matches = typed && q.trim() === typed ? (suggestions ?? []).map((m) => ({ label: typed, category: categoryName(m.category), slug: m.category, count: m.count })) : [];
  const showDropdown = open && (recent.length > 0 || matches.length > 0);

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        go(q);
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
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder={placeholder}
          aria-label="Caută anunțuri"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          autoComplete="off"
          enterKeyHint="search"
          className={cn("field", size === "lg" ? "h-14 rounded-xl pl-12 text-base" : "pl-10")}
        />
      </div>
      {showDropdown && (
        <SearchSuggest hideField query={typed} recent={recent} matches={matches} onPick={go} className="absolute inset-x-0 top-full z-50 mt-2" />
      )}
    </form>
  );
}
