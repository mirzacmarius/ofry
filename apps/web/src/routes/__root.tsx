import { Toaster } from "@ofry/ui/components/sonner";
import { HeadContent, Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { title: "Ofry.ro: anunțuri gratuite din toată România" },
      {
        name: "description",
        content:
          "Cumpără și vinde pe Ofry: imobiliare, mașini, electronice, mobilă, locuri de muncă și servicii în toată România.",
      },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
});

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Pagina nu există</h1>
      <p className="mt-2 text-muted-foreground">Poate anunțul a fost șters sau linkul este greșit.</p>
      <Link to="/" className="btn btn-primary mt-6">
        Înapoi la prima pagină
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Ofry.ro</span>
        <span>Cumpără și vinde simplu, în toată România.</span>
      </div>
    </footer>
  );
}

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange storageKey="ofry-theme">
        <div className="flex min-h-svh flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster richColors position="top-center" />
      </ThemeProvider>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
    </>
  );
}
