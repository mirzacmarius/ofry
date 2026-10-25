import { api } from "@ofry/backend/convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ofry/ui/components/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const navigate = useNavigate();
  const user = useQuery(api.auth.getCurrentUser);
  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Contul meu"
        className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52 bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="font-medium text-foreground">{user?.name}</div>
            <div className="text-xs font-normal">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/my-ads" })}>Anunțurile mele</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/favorites" })}>Favorite</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/messages" })}>Mesaje</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
              });
            }}
          >
            Ieși din cont
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
