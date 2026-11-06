import { api } from "@ofry/backend/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useMemo } from "react";

/** IDs of the listings the signed-in user saved, so cards can show a filled heart. */
export function useFavoriteIds() {
  const { isAuthenticated } = useConvexAuth();
  const favorites = useQuery(api.favorites.list, isAuthenticated ? {} : "skip");
  return useMemo(() => new Set<string>((favorites ?? []).map((f) => f._id)), [favorites]);
}
