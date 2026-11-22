import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { SettingsProvider } from "@/lib/SettingsContext";
import AppShell from "@/components/AppShell";
import { Base44Scripts } from "base44:document";
import appCss from "@/index.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Civic AI — Government schemes and rights, explained simply" },
      {
        name: "description",
        content:
          "Check which government schemes you qualify for, verify WhatsApp forwards, and ask about your rights — in 12 Indian languages, by text or voice.",
      },
      { name: "theme-color", content: "#b34716" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;600&family=Noto+Sans+Bengali:wght@400;600&display=swap",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppShell>
          <Outlet />
        </AppShell>
        <Toaster position="top-center" />
      </SettingsProvider>
    </AuthProvider>
  );
}

function RootDocument({ children }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body data-react-root="true">
        {children}
        <Base44Scripts />
        <Scripts />
      </body>
    </html>
  );
}