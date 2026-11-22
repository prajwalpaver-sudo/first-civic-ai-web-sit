import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Scale, Landmark, Phone, Sparkles } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About, disclaimer and privacy — Civic AI" },
      {
        name: "description",
        content:
          "How Civic AI works, where its information comes from, what it does not do, and how your data stays on your phone.",
      },
    ],
  }),
  component: AboutPage,
});

const HELPLINES = [
  ["National helpline (government services)", "1800-11-1555"],
  ["Free legal aid (NALSA)", "15100"],
  ["Cyber fraud", "1930"],
  ["Women helpline", "181"],
  ["Emergency", "112"],
  ["Ration / PDS", "1967"],
];

const FUTURE = [
  "WhatsApp bot so the same answers work without installing anything",
  "IVR phone line for people who only have a basic phone",
  "Bhashini integration for better Indian-language voice input and output",
  "Offline pack of the most used schemes",
  "District-level office directory and opening hours",
];

function AboutPage() {
  const { t } = useSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-5 sm:px-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("ab.title")}</h1>
      <p className="mt-2 text-[1.05rem] leading-relaxed text-muted-foreground">
        Civic AI explains government schemes, notices and rights in simple language, in 12 Indian
        languages, by text and by voice. It is built for people who are reading a government document for
        the first time.
      </p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="surface p-4">
          <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-2 font-display text-base font-semibold">Where the information comes from</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Scheme details, documents and application steps are collected from official government portals
            such as india.gov.in, pmkisan.gov.in, pmjay.gov.in, nrega.nic.in and scholarships.gov.in. Every
            scheme shows the date it was last checked and a link to the official page.
          </p>
        </div>
        <div className="surface p-4">
          <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="mt-2 font-display text-base font-semibold">How eligibility is decided</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Matching is done by fixed rules in code — age, income, state, occupation and so on. The AI only
            explains the result in your language. It never decides who is eligible.
          </p>
        </div>
        <div className="surface p-4">
          <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-2 font-display text-base font-semibold">{t("ab.privacy")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Your answers, saved items and chat history stay in this browser on this phone. We do not ask
            for your Aadhaar number, phone number or any personal ID, and we do not store them. Photos you
            upload are stored privately and are used only to read the text for your question.
          </p>
        </div>
        <div className="surface p-4">
          <Scale className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="mt-2 font-display text-base font-semibold">Legal information, not legal advice</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Rights explanations are general information about the law. For help with your own case, contact
            free legal aid: NALSA helpline 15100 or your District Legal Services Authority.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border-2 border-amber-300/70 bg-amber-50 p-4 text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-100 sm:p-5">
        <h2 className="font-display text-lg font-semibold">{t("ab.disclaimer")}</h2>
        <p className="mt-1.5 text-sm leading-relaxed">
          Civic AI is an independent information tool. It is not a government website and does not
          represent any department. Eligibility results are indicative only and are not a government
          decision — the official portal or office decides. Scheme amounts, deadlines and rules change;
          always confirm on the official website before applying or paying anything.
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          No genuine government scheme asks for an OTP, a PIN, or a fee to release a benefit. If a message
          does, it is a scam.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
          Helplines
        </h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {HELPLINES.map(([label, number]) => (
            <li key={number} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
              <span className="text-sm">{label}</span>
              <a href={`tel:${number}`} className="shrink-0 font-semibold text-primary">
                {number}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          Coming next
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          {FUTURE.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          to="/check"
          className="tap inline-flex items-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
        >
          {t("home.c1.t")}
        </Link>
        <Link
          to="/verify"
          className="tap inline-flex items-center rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:border-primary/50"
        >
          {t("home.c2.t")}
        </Link>
      </div>
    </div>
  );
}