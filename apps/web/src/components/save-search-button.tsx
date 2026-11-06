import { api } from "@ofry/backend/convex/_generated/api";
import { cn } from "@ofry/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Bell, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { errorMessage } from "@/lib/format";
import { filterKey, pickFilters, type SearchFilters } from "@/lib/search-labels";

/** "Salvează căutarea": get told when new listings match these filters. */
export function SaveSearchButton({ params, className }: { params: SearchFilters; className?: string }) {
  const { isAuthenticated } = useConvexAuth();
  const saved = useQuery(api.savedSearches.list, isAuthenticated ? {} : "skip");
  const save = useMutation(api.savedSearches.save);
  const markSeen = useMutation(api.savedSearches.markSeen);
  const [busy, setBusy] = useState(false);
  const filters = pickFilters(params);
  const match = saved?.find((s) => s.key === filterKey(filters));

  // Looking at the results counts as having seen the new matches.
  const unseen = match && match.newCount > 0 ? match._id : undefined;
  useEffect(() => {
    if (unseen) markSeen({ id: unseen }).catch(() => {});
  }, [unseen, markSeen]);

  const empty = Object.values(filters).every((v) => v === undefined || v === "");
  if (empty) return null;

  if (!isAuthenticated) {
    return (
      <Link to="/login" search={{ redirect: location.pathname + location.search }} className={cn("chip chip-sm", className)}>
        <Bell /> Salvează căutarea
      </Link>
    );
  }
  if (match) {
    return (
      <Link to="/saved-searches" className={cn("chip chip-sm chip-active", className)}>
        <BellRing /> Căutare salvată
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={cn("chip chip-sm", className)}
      disabled={busy || saved === undefined}
      onClick={async () => {
        setBusy(true);
        try {
          await save(filters);
          toast.success("Căutare salvată. Îți spunem când apar anunțuri noi.");
        } catch (err) {
          toast.error(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Bell /> Salvează căutarea
    </button>
  );
}
