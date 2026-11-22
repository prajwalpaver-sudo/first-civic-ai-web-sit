import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, SkipForward } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import { getProfile, saveProfile } from "@/lib/storage";
import { INDIAN_STATES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/check")({
  head: () => ({
    meta: [
      { title: "Check which schemes you qualify for — Civic AI" },
      {
        name: "description",
        content:
          "Answer ten simple questions about your age, income, occupation and household to see which government schemes may apply to you.",
      },
    ],
  }),
  component: CheckWizard,
});

const STEPS = [
  { key: "age", type: "number", titleKey: "w.age", hintKey: "w.ageHint", required: true },
  {
    key: "gender",
    type: "choice",
    titleKey: "w.gender",
    options: [
      ["female", "o.female"],
      ["male", "o.male"],
      ["other", "o.other"],
    ],
  },
  { key: "state", type: "state", titleKey: "w.state" },
  {
    key: "area",
    type: "choice",
    titleKey: "w.area",
    options: [
      ["rural", "o.rural"],
      ["urban", "o.urban"],
    ],
  },
  {
    key: "income",
    type: "number",
    titleKey: "w.income",
    chips: [
      ["Under ₹1 lakh", 75000],
      ["₹1–2.5 lakh", 175000],
      ["₹2.5–5 lakh", 375000],
      ["Above ₹5 lakh", 700000],
    ],
  },
  {
    key: "occupation",
    type: "choice",
    titleKey: "w.occupation",
    options: [
      ["farmer", "o.farmer"],
      ["student", "o.student"],
      ["worker", "o.worker"],
      ["business", "o.business"],
      ["homemaker", "o.homemaker"],
      ["unemployed", "o.unemployed"],
      ["retired", "o.retired"],
    ],
  },
  {
    key: "caste",
    type: "choice",
    titleKey: "w.caste",
    optional: true,
    options: [
      ["sc", "o.sc"],
      ["st", "o.st"],
      ["obc", "o.obc"],
      ["general", "o.general"],
    ],
  },
  { key: "disability", type: "bool", titleKey: "w.disability", optional: true },
  { key: "bpl", type: "bool", titleKey: "w.bpl", optional: true },
  { key: "land", type: "bool", titleKey: "w.land", optional: true },
];

const EMPTY = {
  age: null,
  gender: null,
  state: null,
  area: null,
  income: null,
  occupation: null,
  caste: null,
  disability: null,
  bpl: null,
  land: null,
};

function CheckWizard() {
  const { t } = useSettings();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(EMPTY);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const existing = getProfile();
    if (existing) setProfile({ ...EMPTY, ...existing });
  }, []);

  const current = STEPS[step];
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const finish = (next) => {
    saveProfile(next);
    navigate({ to: "/check/results" });
  };

  const goNext = (next) => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish(next);
  };

  const select = (key, value) => {
    const next = { ...profile, [key]: value };
    setProfile(next);
    setTouched((prev) => ({ ...prev, [key]: true }));
    window.setTimeout(() => goNext(next), 190);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-5 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("c.back")}
        </button>
        <p className="text-sm font-semibold text-muted-foreground">
          {t("w.q", { n: step + 1, m: STEPS.length })}
        </p>
      </div>

      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("w.title")}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-6">
        <h1 className="font-display text-[1.7rem] font-bold leading-tight sm:text-3xl">
          {t(current.titleKey)}
        </h1>
        {current.hintKey && (
          <p className="mt-1 text-sm text-muted-foreground">{t(current.hintKey)}</p>
        )}

        <div className="mt-5">
          {current.type === "number" && (
            <NumberStep
              value={profile[current.key]}
              chips={current.chips}
              onChange={(v) => setProfile({ ...profile, [current.key]: v })}
              onChip={(v) => select(current.key, v)}
            />
          )}

          {current.type === "choice" && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {current.options.map(([value, labelKey]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => select(current.key, value)}
                  aria-pressed={touched[current.key] && profile[current.key] === value}
                  className={cn(
                    "tap flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-4 text-left text-lg font-medium transition-colors",
                    touched[current.key] && profile[current.key] === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {t(labelKey)}
                  {touched[current.key] && profile[current.key] === value && (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          )}

          {current.type === "bool" && (
            <div className="grid gap-2.5 sm:grid-cols-3">
              {[
                ["c.yes", true],
                ["c.no", false],
                ["c.notSure", null],
              ].map(([labelKey, value]) => (
                <button
                  key={labelKey}
                  type="button"
                  onClick={() => select(current.key, value)}
                  aria-pressed={touched[current.key] && profile[current.key] === value}
                  className={cn(
                    "tap rounded-2xl border-2 px-4 py-4 text-lg font-medium transition-colors",
                    touched[current.key] && profile[current.key] === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          )}

          {current.type === "state" && (
            <div className="max-h-[52vh] overflow-y-auto rounded-3xl border border-border bg-card p-2">
              <div className="grid grid-cols-2 gap-2">
                {INDIAN_STATES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => select("state", s)}
                    aria-pressed={profile.state === s}
                    className={cn(
                      "tap rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors",
                      profile.state === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {current.type === "number" && (
            <button
              type="button"
              onClick={() => goNext(profile)}
              disabled={current.required && !profile[current.key]}
              className="tap inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {step === STEPS.length - 1 ? t("w.seeResults") : t("c.next")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {(current.optional || current.type === "state" || current.type === "number") && (
            <button
              type="button"
              onClick={() => select(current.key, null)}
              className="tap inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
              {t("c.skip")} {current.optional && <span className="text-xs">({t("c.optional")})</span>}
            </button>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{t("c.indicative")}</p>
      </div>
    </div>
  );
}

function NumberStep({ value, onChange, onChip, chips }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          inputMode="numeric"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          placeholder="0"
          className="tap w-full rounded-2xl border-2 border-border bg-card px-4 py-4 font-display text-3xl font-semibold tabular-nums outline-none focus:border-primary"
        />
      </div>
      {chips && (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map(([label, amount]) => (
            <button
              key={label}
              type="button"
              onClick={() => onChip(amount)}
              className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/50"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}