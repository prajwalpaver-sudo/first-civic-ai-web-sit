import { AlertTriangle, ExternalLink, ShieldCheck, ShieldAlert, ShieldX, HelpCircle, Copy, Flag } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/lib/SettingsContext";
import ListenButton from "@/components/ListenButton";
import { cn } from "@/lib/utils";

const VERDICTS = {
  verified: {
    key: "v.verified",
    Icon: ShieldCheck,
    wrap: "border-emerald-300 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-200",
    emoji: "✅",
  },
  partly_true: {
    key: "v.partly",
    Icon: ShieldAlert,
    wrap: "border-amber-300 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-950/40",
    text: "text-amber-900 dark:text-amber-200",
    emoji: "⚠️",
  },
  false: {
    key: "v.false",
    Icon: ShieldX,
    wrap: "border-rose-300 bg-rose-50 dark:border-rose-800/60 dark:bg-rose-950/40",
    text: "text-rose-900 dark:text-rose-200",
    emoji: "❌",
  },
  cant_verify: {
    key: "v.unknown",
    Icon: HelpCircle,
    wrap: "border-border bg-secondary/60",
    text: "text-foreground",
    emoji: "❓",
  },
};

export default function VerdictCard({ result, onReport, reported }) {
  const { t } = useSettings();
  const v = VERDICTS[result.verdict] || VERDICTS.cant_verify;
  const { Icon } = v;

  const share = async () => {
    const lines = [
      `Civic AI check: ${v.emoji} ${t(v.key)}`,
      result.claim ? `Claim: ${result.claim}` : "",
      result.reasoning || "",
      result.evidence?.length ? `Sources: ${result.evidence.map((e) => e.url).join(", ")}` : "",
      "Indicative only — confirm at the official portal or office.",
    ].filter(Boolean);
    const text = lines.join("\n");
    try {
      if (navigator.share) await navigator.share({ title: "Civic AI fact check", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success(t("c.copied"));
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className={cn("rounded-3xl border-2 p-5 sm:p-6", v.wrap)}>
      <div className="flex items-start gap-3">
        <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card/70", v.text)}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t("f.verdict")}
          </p>
          <h2 className={cn("font-display text-2xl font-bold leading-tight", v.text)}>
            {v.emoji} {t(v.key)}
          </h2>
        </div>
      </div>

      {result.claim && (
        <p className="mt-4 rounded-2xl bg-card/70 p-3 text-sm leading-relaxed">
          <span className="font-semibold">{t("f.verdict")}: </span>
          {result.claim}
        </p>
      )}

      {result.reasoning && (
        <p className="mt-3 text-[1.02rem] leading-relaxed">{result.reasoning}</p>
      )}

      {result.what_to_do && (
        <p className="mt-3 rounded-2xl border border-border bg-card/70 p-3 text-sm leading-relaxed">
          <span className="font-semibold">Next step: </span>
          {result.what_to_do}
        </p>
      )}

      {Array.isArray(result.red_flags) && result.red_flags.length > 0 && (
        <div className="mt-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            {t("f.flags")}
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {result.red_flags.map((flag) => (
              <li key={flag} className="flex gap-2">
                <span className="text-rose-600 dark:text-rose-400" aria-hidden="true">✕</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(result.evidence) && result.evidence.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold">{t("f.evidence")}</h3>
          <ul className="mt-2 space-y-2">
            {result.evidence.map((e) => (
              <li key={e.id} className="rounded-2xl border border-border bg-card/80 p-3">
                <a
                  href={e.source_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-start gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {e.title}
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {t("c.verifiedOn")}: {e.last_verified}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ListenButton
          text={`${t(v.key)}. ${result.reasoning || ""} ${result.what_to_do || ""}`}
          compact
        />
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold transition-colors hover:border-primary/50"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          {t("c.share")}
        </button>
        <button
          type="button"
          onClick={onReport}
          disabled={reported}
          className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-card px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
        >
          <Flag className="h-4 w-4" aria-hidden="true" />
          {reported ? t("f.reported") : t("f.report")}
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("c.indicative")}</p>
    </div>
  );
}