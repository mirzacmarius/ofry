import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

import { AuthCard } from "@/components/auth-card";
import Loader from "@/components/loader";

/** Pages under this layout require an account; signing in renders the page in place. */
export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <>
      <Authenticated>
        <Outlet />
      </Authenticated>
      <Unauthenticated>
        <div className="px-4">
          <AuthCard intro="Ai nevoie de un cont pentru a continua. Durează mai puțin de un minut." />
        </div>
      </Unauthenticated>
      <AuthLoading>
        <Loader />
      </AuthLoading>
    </>
  );
}
