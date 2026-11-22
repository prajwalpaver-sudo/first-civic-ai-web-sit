import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home as HomeIcon,
  ListChecks,
  ShieldCheck,
  MessageCircle,
  Bookmark,
  Globe,
  Moon,
  Sun,
  Type,
} from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import { languageByCode } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import LanguagePicker from "@/components/LanguagePicker";
import Footer from "@/components/Footer";
import AskFab from "@/components/AskFab";

const NAV = [
  { to: "/", key: "nav.home", icon: HomeIcon },
  { to: "/check", key: "nav.check", icon: ListChecks },
  { to: "/verify", key: "nav.verify", icon: ShieldCheck },
  { to: "/ask", key: "nav.ask", icon: MessageCircle },
  { to: "/saved", key: "nav.saved", icon: Bookmark },
];

export default function AppShell({ children }) {
  const { t, lang, openLangPicker, theme, toggleTheme, big, toggleBig } = useSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = languageByCode(lang);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" aria-label="Civic AI home">
            <Logo showTagline tagline={t("tagline")} />
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map(({ to, key, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(to)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={openLangPicker}
              className="tap flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold transition-colors hover:border-primary/50"
              aria-label={`${t("c.language")}: ${current.label}`}
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span className="max-w-[6.5rem] truncate">{current.native}</span>
            </button>
            <button
              type="button"
              onClick={toggleBig}
              aria-pressed={big}
              className="tap hidden h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
              aria-label={t("c.textSize")}
              title={t("c.textSize")}
            >
              <Type className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="tap flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={t("c.theme")}
              title={t("c.theme")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Main"
      >
        <div className="grid grid-cols-5">
          {NAV.map(({ to, key, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex min-h-[3.75rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[0.68rem] font-medium leading-tight transition-colors",
                isActive(to) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive(to) && "stroke-[2.4]")} aria-hidden="true" />
              <span className="text-center">{t(key)}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="h-16 md:hidden" aria-hidden="true" />
      <AskFab />
      <LanguagePicker />
    </div>
  );
}