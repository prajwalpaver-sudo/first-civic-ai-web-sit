import { Link } from "@tanstack/react-router";
import { Phone, ArrowUpRight } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import Logo from "@/components/Logo";

const SOURCES = [
  { label: "india.gov.in", href: "https://www.india.gov.in" },
  { label: "pib.gov.in", href: "https://pib.gov.in" },
  { label: "pmkisan.gov.in", href: "https://pmkisan.gov.in" },
  { label: "pmjay.gov.in", href: "https://pmjay.gov.in" },
  { label: "nrega.nic.in", href: "https://nrega.nic.in" },
];

const HELPLINES = [
  ["Cyber fraud", "1930"],
  ["Ration / PDS", "1967"],
  ["Free legal aid", "15100"],
  ["National helpline", "1800-11-1555"],
];

export default function Footer() {
  const { t } = useSettings();
  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/check", label: t("nav.check") },
    { to: "/verify", label: t("nav.verify") },
    { to: "/ask", label: t("nav.ask") },
    { to: "/saved", label: t("nav.saved") },
    { to: "/about", label: t("nav.about") },
  ];

  return (
    <footer className="mt-12 border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Government schemes, notices and rights — explained simply, in your language, by text or
            voice.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Explore
          </h2>
          <ul className="mt-3 space-y-2">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm font-medium text-foreground/85 transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Official sources
          </h2>
          <ul className="mt-3 space-y-2">
            {SOURCES.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  {s.label}
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            Helplines
          </h2>
          <ul className="mt-3 space-y-2">
            {HELPLINES.map(([label, number]) => (
              <li key={number} className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <a href={`tel:${number}`} className="shrink-0 font-semibold text-primary">
                  {number}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="max-w-2xl">
            Civic AI is an independent information tool. It is not a government service and not legal
            advice. Always confirm at the official portal or office.
          </p>
          <Link to="/about" className="shrink-0 font-medium text-foreground/80 hover:text-primary">
            Disclaimer &amp; privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}