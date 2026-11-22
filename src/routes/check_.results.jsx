import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Sparkles, AlertTriangle, RotateCcw, ChevronDown, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/lib/SettingsContext";
import { getProfile } from "@/lib/storage";
import { evaluateAll, groupResults } from "@/lib/eligibility";
import { explainResults } from "@/lib/server-fns";
import SchemeCard from "@/components/SchemeCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/check_/results")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Your scheme results — Civic AI" }],
  }),
  component: Results,
});

function Section({ title, count, tone, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const tones = {
    green: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
    amber: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
    gray: "bg-secondary text-muted-foreground",
  };
  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className={cn("rounded-full px-3 py-1.5 text-sm font-bold", tones[tone])}>{count}</span>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <ChevronDown
          className={cn("ml-auto h-5 w-5 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </section>
  );
}

function Results() {
  const { t, lang } = useSettings();
  const navigate = useNavigate();
  const explainFn = useServerFn(explainResults);
  const [profile, setProfile] = useState(null);
  const [grouped, setGrouped] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [intro, setIntro] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      navigate({ to: "/check" });
      return;
    }
    setProfile(p);
    setGrouped(groupResults(evaluateAll(p)));
  }, [navigate]);

  const explain = async () => {
    if (!grouped) return;
    setBusy(true);
    try {
      const ids = [...grouped.eligible, ...grouped.maybe].map((r) => r.id).slice(0, 12);
      if (!ids.length) return;
      const res = await explainFn({ data: { profile, ids, lang, simple: false } });
      if (res.ok) {
        setIntro(res.intro);
        const map = {};
        res.items.forEach((i) => {
          map[i.id] = i.text;
        });
        setExplanations(map);
      } else {
        toast.error("Could not write the explanation right now. Please try again.");
      }
    } catch {
      toast.error("Could not write the explanation right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!grouped) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">{t("c.loading")}</div>
    );
  }

  const total = grouped.eligible.length + grouped.maybe.length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-5 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("r.title")}</h1>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {t("r.count", { n: total })}
        </span>
        <Link
          to="/check"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold hover:border-primary/50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t("r.restart")}
        </Link>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-300/70 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
        {t("c.indicative")}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={explain}
          disabled={busy || total === 0}
          className="tap inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {busy ? t("c.loading") : t("r.explain")}
        </button>
        <Link
          to="/saved"
          className="tap inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:border-primary/50"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          {t("s.docs")}
        </Link>
      </div>

      {intro && (
        <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-[1.02rem] leading-relaxed">
          {intro}
        </p>
      )}

      {grouped.eligible.length > 0 && (
        <Section title={t("r.eligible")} count={grouped.eligible.length} tone="green">
          {grouped.eligible.map((r) => (
            <SchemeCard
              key={r.id}
              scheme={r.scheme}
              status="eligible"
              reasons={r.reasons}
              explanation={explanations[r.id]}
            />
          ))}
        </Section>
      )}

      {grouped.maybe.length > 0 && (
        <Section title={t("r.maybe")} count={grouped.maybe.length} tone="amber">
          {grouped.maybe.map((r) => (
            <SchemeCard
              key={r.id}
              scheme={r.scheme}
              status="maybe"
              reasons={r.reasons}
              explanation={explanations[r.id]}
            />
          ))}
        </Section>
      )}

      {grouped.not.length > 0 && (
        <Section title={t("r.not")} count={grouped.not.length} tone="gray" defaultOpen={false}>
          {grouped.not.map((r) => (
            <SchemeCard key={r.id} scheme={r.scheme} status="not_eligible" reasons={r.reasons} />
          ))}
        </Section>
      )}

      {total === 0 && (
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-center">
          <Check className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-sm text-muted-foreground">{t("r.none")}</p>
          <Link to="/schemes" className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
            {t("r.allSchemes")}
          </Link>
        </div>
      )}
    </div>
  );
}