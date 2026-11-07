import { cn } from "@ofry/ui/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { Heart, Home, Plus, Search, User } from "lucide-react";
import type { ReactNode } from "react";

function Item({
  to,
  label,
  active,
  icon,
}: {
  to: "/" | "/search" | "/favorites" | "/account" | "/login";
  label: string;
  active: boolean;
  icon: ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-2 text-[0.6875rem] font-medium transition [&_svg]:size-6",
        active ? "text-brand [&_svg]:fill-current" : "text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

/** Phone-only tab bar. Hidden on screens that bring their own bottom bar. */
export function BottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useConvexAuth();
  if (pathname.startsWith("/listing/") || pathname.startsWith("/messages/")) return null;

  return (
    <nav
      aria-label="Navigare principală"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center px-2">
        <Item to="/" label="Acasă" active={pathname === "/"} icon={<Home />} />
        <Item to="/search" label="Caută" active={pathname === "/search"} icon={<Search className="!fill-none" />} />
        <div className="flex flex-1 justify-center">
          <Link
            to="/new"
            aria-label="Adaugă anunț"
            className="flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-md transition active:scale-95"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </Link>
        </div>
        <Item to="/favorites" label="Favorite" active={pathname === "/favorites"} icon={<Heart />} />
        <Item
          to={isAuthenticated ? "/account" : "/login"}
          label="Contul meu"
          active={["/account", "/my-ads", "/login", "/saved-searches", "/notifications"].includes(pathname)}
          icon={<User />}
        />
      </div>
    </nav>
  );
}
