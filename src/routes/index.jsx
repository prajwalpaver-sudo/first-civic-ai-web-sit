import { createFileRoute, Link } from "@tanstack/react-router";
import { ListChecks, ShieldCheck, MessageCircle, ArrowRight, Languages, Landmark, Sparkles } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import ActionCard from "@/components/home/ActionCard";
import LanguageStrip from "@/components/home/LanguageStrip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Civic AI — Government schemes and rights, explained simply" },
      {
        name: "description",
        content:
          "Check which government schemes you qualify for, verify a WhatsApp forward, and ask about ration cards, pensions or your rights — in 12 Indian languages.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
      <section className="hero-mesh relative overflow-hidden rounded-[2rem] border border-border px-5 py-7 sm:px-9 sm:py-11">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[hsl(24_85%_55%/0.16)] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            {t("home.eyebrow")}
          </span>

          <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.1] sm:text-[2.75rem]">
            {t("home.h1")}
          </h1>
          <p className="mt-3 max-w-xl text-[1.02rem] leading-relaxed text-muted-foreground sm:text-lg">
            {t("home.sub")}
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              to="/ask"
              className="tap inline-flex items-center justify-center gap-2.5 rounded-2xl bg-accent px-5 py-3.5 text-base font-semibold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              {t("home.aiCta")}
            </Link>
            <Link
              to="/check"
              className="tap inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-5 py-3.5 text-base font-semibold transition-colors hover:border-primary/50"
            >
              {t("nav.check")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3" aria-label="Main actions">
        <ActionCard
          to="/check"
          icon={ListChecks}
          tone="saffron"
          title={t("home.c1.t")}
          subtitle={t("home.c1.s")}
        />
        <ActionCard
          to="/verify"
          icon={ShieldCheck}
          tone="teal"
          title={t("home.c2.t")}
          subtitle={t("home.c2.s")}
        />
        <ActionCard
          to="/ask"
          icon={MessageCircle}
          tone="plum"
          title={t("home.c3.t")}
          subtitle={t("home.c3.s")}
        />
      </section>

      <section className="mt-8" aria-labelledby="lang-heading">
        <h2 id="lang-heading" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Languages className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("home.chooseLang")}
        </h2>
        <div className="mt-3">
          <LanguageStrip />
        </div>
      </section>
    </div>
  );
}