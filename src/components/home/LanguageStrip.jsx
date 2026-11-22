import { LANGUAGES } from "@/lib/i18n";
import { useSettings } from "@/lib/SettingsContext";
import { cn } from "@/lib/utils";

export default function LanguageStrip() {
  const { lang, setLang } = useSettings();

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={l.code === lang}
          className={cn(
            "tap shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            l.code === lang
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-primary/50"
          )}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
}