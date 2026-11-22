import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import { schemes } from "@/lib/eligibility";
import SchemeCard from "@/components/SchemeCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/schemes/")({
  head: () => ({
    meta: [
      { title: "All government schemes — Civic AI" },
      {
        name: "description",
        content:
          "Browse 30+ central and state government schemes with benefits, documents needed, how to apply, official links and helpline numbers.",
      },
    ],
  }),
  component: SchemesPage,
});

const CATEGORIES = ["All", ...Array.from(new Set(schemes.map((s) => s.category)))];

function SchemesPage() {
  const { t } = useSettings();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return schemes.filter((s) => {
      const catOk = cat === "All" || s.category === cat;
      if (!catOk) return false;
      if (!needle) return true;
      return (
        s.name.toLowerCase().includes(needle) ||
        s.full_name.toLowerCase().includes(needle) ||
        s.summary.toLowerCase().includes(needle) ||
        (s.tags || []).some((tag) => tag.includes(needle))
      );
    });
  }, [q, cat]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-5 sm:px-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("r.allSchemes")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("r.count", { n: schemes.length })} · {t("home.src")}
      </p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("r.allSchemes")}
          aria-label={t("r.allSchemes")}
          className="tap w-full rounded-2xl border-2 border-border bg-card py-3.5 pl-12 pr-4 text-base outline-none focus:border-primary"
        />
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {filtered.map((s) => (
          <SchemeCard key={s.id} scheme={s} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {t("r.none")}
        </p>
      )}
    </div>
  );
}