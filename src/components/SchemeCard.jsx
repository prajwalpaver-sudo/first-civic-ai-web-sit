import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, X, Minus, ChevronDown, ExternalLink, Phone, FileText, ListOrdered, Info } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import SaveButton from "@/components/SaveButton";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  eligible: {
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
    key: "r.eligible",
  },
  maybe: {
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
    key: "r.maybe",
  },
  not_eligible: {
    badge: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
    key: "r.not",
  },
};

function RuleIcon({ status }) {
  if (status === "pass")
    return <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
  if (status === "fail")
    return <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />;
  return <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />;
}

export default function SchemeCard({ scheme, status, reasons, explanation, defaultOpen = false }) {
  const { t } = useSettings();
  const [open, setOpen] = useState(defaultOpen);
  const style = status ? STATUS_STYLES[status] : null;

  return (
    <article className="surface overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-semibold leading-snug">{scheme.name}</h3>
              {style && (
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", style.badge)}>
                  {t(style.key)}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{scheme.summary}</p>
            <p className="mt-2 text-sm font-medium leading-relaxed">{scheme.benefit}</p>
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

        {explanation && (
          <p className="mt-3 rounded-2xl bg-secondary/60 p-3 text-sm leading-relaxed">{explanation}</p>
        )}

        {Array.isArray(reasons) && reasons.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {reasons.map((r, i) => (
              <li key={`${r.label}-${i}`} className="flex gap-2 text-sm leading-snug">
                <RuleIcon status={r.status} />
                <span className={cn(r.status === "fail" && "text-muted-foreground line-through decoration-1")}>
                  {r.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold transition-colors hover:border-primary/50"
          >
            {t("r.docs")} · {t("r.steps")}
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
          </button>
          <Link
            to="/schemes/$schemeId"
            params={{ schemeId: scheme.id }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("r.allSchemes")}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {open && (
        <div className="grid gap-4 border-t border-border bg-secondary/30 p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
              {t("r.docs")}
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {(scheme.documents || []).map((d) => (
                <li key={d} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <ListOrdered className="h-4 w-4 text-primary" aria-hidden="true" />
              {t("r.steps")}
            </h4>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-muted-foreground">
              {(scheme.steps || []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-sm">
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
          {scheme.note && (
            <p className="sm:col-span-2 flex gap-2 rounded-xl bg-card p-3 text-xs leading-relaxed text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              {scheme.note}
            </p>
          )}
        </div>
      )}
    </article>
  );
}