import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, FileText, ListOrdered, Phone, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/lib/SettingsContext";
import { getScheme } from "@/lib/eligibility";
import { translateContent } from "@/lib/server-fns";
import SaveButton from "@/components/SaveButton";
import ListenButton from "@/components/ListenButton";

export const Route = createFileRoute("/schemes/$schemeId")({
  head: ({ params }) => {
    const scheme = getScheme(params.schemeId);
    return {
      meta: [
        { title: `${scheme ? scheme.name : "Scheme"} — Civic AI` },
        { name: "description", content: scheme ? scheme.summary : "Government scheme details" },
      ],
    };
  },
  component: SchemeDetailPage,
});

function SchemeDetailPage() {
  const { t, lang } = useSettings();
  const { schemeId } = Route.useParams();
  const scheme = getScheme(schemeId);
  const translateFn = useServerFn(translateContent);
  const [translated, setTranslated] = useState("");
  const [busy, setBusy] = useState(false);

  if (!scheme) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">This scheme could not be found.</p>
        <Link to="/schemes" className="mt-3 inline-block font-semibold text-primary underline-offset-4 hover:underline">
          {t("r.allSchemes")}
        </Link>
      </div>
    );
  }

  const speakable = `${scheme.name}. ${scheme.benefit} ${t("r.docs")}: ${scheme.documents.join(", ")}. ${t("r.steps")}: ${scheme.steps.join(" ")}`;

  const runTranslate = async () => {
    setBusy(true);
    try {
      const res = await translateFn({
        data: {
          text: `${scheme.summary} ${scheme.benefit} ${t("r.docs")}: ${scheme.documents.join(", ")}. ${t("r.steps")}: ${scheme.steps.join(" ")}`,
          targetLang: lang,
        },
      });
      if (res.ok) setTranslated(res.text);
      else toast.error("Could not translate right now.");
    } catch {
      toast.error("Could not translate right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-4 sm:px-6">
      <Link
        to="/schemes"
        className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("r.allSchemes")}
      </Link>

      <div className="mt-2 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {scheme.category} · {scheme.level}
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">{scheme.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{scheme.full_name}</p>
        </div>
        <SaveButton
          item={{
            id: `scheme:${scheme.id}`,
            type: "scheme",
            refId: scheme.id,
            title: scheme.name,
            text: scheme.benefit,
          }}
        />
      </div>

      <p className="mt-4 text-[1.05rem] leading-relaxed">{scheme.summary}</p>

      <div className="mt-4 rounded-3xl border-2 border-primary/25 bg-primary/5 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{scheme.category}</p>
        <p className="mt-1 font-display text-lg font-semibold leading-snug">{scheme.benefit}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ListenButton text={speakable} />
        <button
          type="button"
          onClick={runTranslate}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold hover:border-primary/50 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {busy ? t("c.loading") : t("r.explain")}
        </button>
      </div>

      {translated && (
        <p className="mt-3 rounded-2xl border border-border bg-secondary/50 p-4 text-[1.02rem] leading-relaxed">
          {translated}
        </p>
      )}

      <section className="mt-6">
        <h2 className="font-display text-lg font-semibold">{t("r.why")}</h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
          {scheme.rules.map((r) => (
            <li key={r.label} className="flex gap-2">
              <span className="text-primary" aria-hidden="true">•</span>
              <span>{r.label}</span>
            </li>
          ))}
        </ul>
        {scheme.note && (
          <p className="mt-2 flex gap-2 rounded-xl bg-secondary/50 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
            {scheme.note}
          </p>
        )}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="surface p-4">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("r.docs")}
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {scheme.documents.map((d) => (
              <li key={d} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface p-4">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <ListOrdered className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("r.steps")}
          </h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-muted-foreground">
            {scheme.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-5 surface p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a
            href={scheme.source_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            {t("r.apply")}
          </a>
          {scheme.helpline && (
            <a href={`tel:${scheme.helpline}`} className="inline-flex items-center gap-1.5 font-semibold">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {t("r.helpline")}: {scheme.helpline}
            </a>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {t("c.verifiedOn")}: {scheme.last_verified}
          </span>
        </div>
        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          {t("c.indicative")}
        </p>
      </section>
    </div>
  );
}