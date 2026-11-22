import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, FileCheck2, Trash2, ArrowRight } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import { getDocs, getProfile, getSaved, removeSaved, toggleDoc } from "@/lib/storage";
import { documentsFor, evaluateAll, getScheme } from "@/lib/eligibility";
import SchemeCard from "@/components/SchemeCard";
import ListenButton from "@/components/ListenButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/saved")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Saved schemes and documents — Civic AI" }],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { t } = useSettings();
  const [items, setItems] = useState([]);
  const [docs, setDocs] = useState({});
  const [docList, setDocList] = useState([]);

  useEffect(() => {
    setItems(getSaved());
    setDocs(getDocs());
    const profile = getProfile();
    if (profile) setDocList(documentsFor(evaluateAll(profile)));
  }, []);

  const remove = (id) => setItems(removeSaved(id));

  const savedSchemes = items.filter((i) => i.type === "scheme" && getScheme(i.refId));
  const savedAnswers = items.filter((i) => i.type === "answer");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-5 sm:px-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("s.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("s.sub")}</p>

      <section className="mt-5 rounded-3xl border border-border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <FileCheck2 className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("s.docs")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("s.docsSub")}</p>

        {docList.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            <Link to="/check" className="font-semibold text-primary underline-offset-4 hover:underline">
              {t("home.c1.t")}
            </Link>{" "}
            — {t("r.docs")}
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {docList.map((doc) => {
              const checked = Boolean(docs[doc]);
              return (
                <li key={doc}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => setDocs(toggleDoc(doc))}
                    className={cn(
                      "tap flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                      checked
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      )}
                      aria-hidden="true"
                    >
                      {checked ? "✓" : ""}
                    </span>
                    <span className={cn(checked && "line-through decoration-1")}>{doc}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {savedSchemes.length > 0 && (
        <section className="mt-7">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Bookmark className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("nav.check")} · {savedSchemes.length}
          </h2>
          <div className="mt-3 space-y-3">
            {savedSchemes.map((item) => (
              <SchemeCard key={item.id} scheme={getScheme(item.refId)} />
            ))}
          </div>
        </section>
      )}

      {savedAnswers.length > 0 && (
        <section className="mt-7">
          <h2 className="font-display text-lg font-semibold">
            {t("nav.ask")} · {savedAnswers.length}
          </h2>
          <div className="mt-3 space-y-3">
            {savedAnswers.map((item) => (
              <article key={item.id} className="surface p-4">
                <p className="text-sm leading-relaxed">{item.text}</p>
                <div className="mt-3 flex items-center gap-2">
                  <ListenButton text={item.text} compact />
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {t("c.remove")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <div className="mt-7 rounded-3xl border border-dashed border-border p-6 text-center">
          <Bookmark className="mx-auto h-7 w-7 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-sm text-muted-foreground">{t("s.empty")}</p>
          <Link
            to="/schemes"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("r.allSchemes")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}