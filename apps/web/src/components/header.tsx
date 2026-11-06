import { api } from "@ofry/backend/convex/_generated/api";
import { Link, useLocation } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { Heart, MessageCircle, Plus } from "lucide-react";

import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";
import { SearchBar } from "./search-bar";
import UserMenu from "./user-menu";

function UnreadBadge() {
  const unread = useQuery(api.messages.unreadCount);
  if (!unread) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground ring-2 ring-background">
      {unread}
    </span>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-2 sm:gap-3">
        <Link to="/" aria-label="Ofry, prima pagină" className="mr-2 shrink-0">
          <Logo />
        </Link>
        <SearchBar className="hidden flex-1 md:block md:max-w-lg" />
        <nav className="ml-auto flex items-center gap-1">
          <Authenticated>
            <Link
              to="/favorites"
              className="btn btn-ghost btn-icon hidden md:inline-flex lg:w-auto lg:px-3"
              activeProps={{ className: "bg-surface" }}
              aria-label="Favorite"
            >
              <Heart />
              <span className="hidden lg:inline">Favorite</span>
            </Link>
            <Link
              to="/messages"
              className="btn btn-ghost btn-icon lg:w-auto lg:px-3"
              activeProps={{ className: "bg-surface" }}
              aria-label="Mesaje"
            >
              <span className="relative">
                <MessageCircle />
                <UnreadBadge />
              </span>
              <span className="hidden lg:inline">Mesaje</span>
            </Link>
          </Authenticated>
          <Link to="/new" className="btn btn-accent ml-1 hidden md:inline-flex">
            <Plus strokeWidth={2.5} />
            Adaugă anunț
          </Link>
          <ModeToggle />
          <Authenticated>
            <UserMenu />
          </Authenticated>
          <Unauthenticated>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Intră în cont
            </Link>
          </Unauthenticated>
          <AuthLoading>
            <div className="h-9 w-24 animate-pulse rounded-md bg-surface" />
          </AuthLoading>
        </nav>
      </div>
      {pathname !== "/" && pathname !== "/search" && !pathname.startsWith("/listing/") && (
        <div className="container-page pb-3 md:hidden">
          <SearchBar />
        </div>
      )}
    </header>
  );
}
