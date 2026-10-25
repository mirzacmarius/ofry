import { api } from "@ofry/backend/convex/_generated/api";
import type { Id } from "@ofry/backend/convex/_generated/dataModel";
import { cn } from "@ofry/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useConvexAuth, useMutation } from "convex/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { errorMessage } from "@/lib/format";

export function FavoriteButton({
  listingId,
  isFavorite,
  className,
  withLabel,
}: {
  listingId: Id<"listings">;
  isFavorite: boolean;
  className?: string;
  withLabel?: boolean;
}) {
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const toggle = useMutation(api.favorites.toggle);

  return (
    <button
      type="button"
      aria-label={isFavorite ? "Elimină de la favorite" : "Salvează la favorite"}
      aria-pressed={isFavorite}
      className={cn(withLabel ? "btn btn-outline" : "", className)}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
          navigate({ to: "/login", search: { redirect: location.pathname } });
          return;
        }
        try {
          const saved = await toggle({ listingId });
          toast.success(saved ? "Salvat la favorite" : "Eliminat de la favorite");
        } catch (err) {
          toast.error(errorMessage(err));
        }
      }}
    >
      <Heart className={cn("size-5", isFavorite && "fill-red-500 text-red-500")} />
      {withLabel && (isFavorite ? "Salvat" : "Salvează")}
    </button>
  );
}
