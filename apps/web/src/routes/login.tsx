import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import z from "zod";

import { AuthCard } from "@/components/auth-card";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  // Only allow same-site redirects.
  const target = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";

  useEffect(() => {
    if (isAuthenticated) navigate({ href: target, replace: true });
  }, [isAuthenticated, navigate, target]);

  return (
    <div className="px-4">
      <AuthCard />
    </div>
  );
}
