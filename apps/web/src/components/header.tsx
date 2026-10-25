import { api } from "@ofry/backend/convex/_generated/api";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { Heart, MessageCircle, Plus, Search } from "lucide-react";
import { useState } from "react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

function UnreadBadge() {
  const unread = useQuery(api.messages.unreadCount);
  if (!unread) return null;
  return (
    <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {unread}
    </span>
  );
}

export function HeaderSearch({ className }: { className?: string }) {
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
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Caută pe Ofry"
          aria-label="Caută anunțuri"
          className="field pl-9"
        />
      </div>
    </form>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-1 text-2xl font-black tracking-tight text-primary">
          ofry
          <span className="text-sm font-semibold text-muted-foreground">.ro</span>
        </Link>
        <HeaderSearch className="mx-2 hidden flex-1 md:block md:max-w-md" />
        <nav className="ml-auto flex items-center gap-1">
          <Authenticated>
            <Link
              to="/favorites"
              className="btn btn-ghost px-3"
              activeProps={{ className: "text-primary" }}
              aria-label="Favorite"
            >
              <Heart />
              <span className="hidden lg:inline">Favorite</span>
            </Link>
            <Link
              to="/messages"
              className="btn btn-ghost relative px-3"
              activeProps={{ className: "text-primary" }}
              aria-label="Mesaje"
            >
              <span className="relative">
                <MessageCircle />
                <UnreadBadge />
              </span>
              <span className="hidden lg:inline">Mesaje</span>
            </Link>
          </Authenticated>
          <Link to="/new" className="btn btn-primary ml-1">
            <Plus />
            <span className="hidden sm:inline">Adaugă anunț</span>
          </Link>
          <ModeToggle />
          <Authenticated>
            <UserMenu />
          </Authenticated>
          <Unauthenticated>
            <Link to="/login" className="btn btn-outline">
              Intră în cont
            </Link>
          </Unauthenticated>
          <AuthLoading>
            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
          </AuthLoading>
        </nav>
      </div>
      {pathname !== "/" && pathname !== "/search" && (
        <div className="px-4 pb-3 md:hidden">
          <HeaderSearch />
        </div>
      )}
    </header>
  );
}
