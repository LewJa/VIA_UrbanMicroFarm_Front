import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider, useAuth } from "~/context/AuthContext";
import { AlertsProvider } from "~/context/AlertsContext";
import AlertToast from "~/components/AlertToast";

const DARK_VARS: Record<string, string> = {
  "--color-mf-bg":       "#1C1B16",
  "--color-mf-bg-2":     "#222119",
  "--color-mf-card":     "#2A2920",
  "--color-mf-line":     "#383628",
  "--color-mf-line-2":   "#443F2E",
  "--color-mf-ink":      "#F0EDE4",
  "--color-mf-ink-2":    "#C4BEAC",
  "--color-mf-ink-3":    "#8A8575",
  "--color-mf-ink-4":    "#5E5A4E",
  "--color-mf-cream":    "#2E2D23",
  "--color-mf-sand":     "#3A3828",
  "--color-mf-forest":   "#5A8A50",
  "--color-mf-forest-2": "#6AA360",
};

function ThemeApplier() {
  const { user } = useAuth();
  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove("light", "dark");
    // Clear any previously forced dark variables
    Object.keys(DARK_VARS).forEach((k) => el.style.removeProperty(k));

    if (user?.theme === "dark") {
      el.classList.add("dark");
      // Inline styles have the highest CSS priority — guaranteed to override @theme
      Object.entries(DARK_VARS).forEach(([k, v]) => el.style.setProperty(k, v));
    } else if (user?.theme === "light") {
      el.classList.add("light");
      // No inline overrides needed; default @theme values are already light
    }
    // "system" → no inline overrides, CSS @media (prefers-color-scheme: dark) handles it
  }, [user?.theme]);
  return null;
}

export const links: Route.LinksFunction = () => [
  {
    rel: "icon",
    href: "/LogoLight.svg",
    media: "(prefers-color-scheme: light)",
  },
  {
    rel: "icon",
    href: "/LogoDark.svg",
    media: "(prefers-color-scheme: dark)",
  },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=DM+Sans:ital,opsz,wght@0,9..40,300..900;1,9..40,300..900&family=JetBrains+Mono:wght@400;500&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

import { Navbar } from "./components/navbar/Navbar";

const AUTH_PATHS = new Set(["/", "/login", "/register"]);

export default function App() {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.has(location.pathname);

  return (
    <AuthProvider>
      <AlertsProvider>
        <ThemeApplier />
        <AlertToast />
        <div className="min-h-screen flex flex-col md:block">
          {!isAuthPage && <Navbar />}
          <div className={`flex-1 overflow-auto${isAuthPage ? "" : " pb-20 md:pb-0"}`}>
            <Outlet />
          </div>
        </div>
      </AlertsProvider>
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;  
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
