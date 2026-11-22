import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, Upload, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useSettings } from "@/lib/SettingsContext";
import { factCheck, reportScam } from "@/lib/server-fns";
import VerdictCard from "@/components/factcheck/VerdictCard";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a message or notice — Civic AI" },
      {
        name: "description",
        content:
          "Paste a WhatsApp forward or upload a photo of a government notice and see if it is true, with official sources and scam warning signs.",
      },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { t, lang } = useSettings();
  const checkFn = useServerFn(factCheck);
  const reportFn = useServerFn(reportScam);
  const fileRef = useRef(null);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [reported, setReported] = useState(false);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Please choose a file smaller than 8 MB.");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const run = async () => {
    if (!text.trim() && !file) {
      toast.error(t("f.sub"));
      return;
    }
    setBusy(true);
    setResult(null);
    setReported(false);
    try {
      let fileUrl = null;
      if (file) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
          file_uri,
          expires_in: 900,
        });
        fileUrl = signed_url;
      }
      const res = await checkFn({
        data: {
          text: text.trim() || undefined,
          ...(fileUrl ? { fileUrl } : {}),
          lang,
        },
      });
      if (!res.ok) {
        toast.error("Please paste a message or upload a photo first.");
        return;
      }
      setResult(res);
    } catch {
      toast.error("The check could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const report = async () => {
    try {
      await reportFn({
        data: { claim: result?.claim || text.slice(0, 500), verdict: result?.verdict || "unknown", language: lang },
      });
      setReported(true);
    } catch {
      toast.error("Could not save the report. Please try again.");
    }
  };

  const reset = () => {
    setResult(null);
    setText("");
    setFile(null);
    setReported(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-5 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight">{t("f.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("f.sub")}</p>
        </div>
      </div>

      {!result && (
        <>
          <label htmlFor="claim" className="sr-only">
            {t("f.placeholder")}
          </label>
          <textarea
            id="claim"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            maxLength={6000}
            placeholder={t("f.placeholder")}
            className="mt-4 w-full rounded-3xl border-2 border-border bg-card p-4 text-[1.02rem] leading-relaxed outline-none focus:border-primary"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={pickFile}
              className="hidden"
              id="notice-file"
            />
            <label
              htmlFor="notice-file"
              className="tap inline-flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:border-primary/50"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {t("c.upload")}
            </label>
            <span className="text-xs text-muted-foreground">(stored privately)</span>

            {file && (
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
                {file.name}
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  aria-label={t("c.remove")}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="tap mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground disabled:opacity-70 sm:w-auto"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Sparkles className="h-5 w-5" aria-hidden="true" />}
            {busy ? t("c.loading") : t("f.run")}
          </button>

          <p className="mt-4 rounded-2xl border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
            The message is checked only against official government sources. Never share an OTP, PIN or
            bank password with anyone. (stored privately)
          </p>
        </>
      )}

      {result && (
        <div className="mt-4">
          <VerdictCard result={result} onReport={report} reported={reported} />
          <button
            type="button"
            onClick={reset}
            className="tap mt-3 inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:border-primary/50"
          >
            {t("f.again")}
          </button>
        </div>
      )}
    </div>
  );
}