import { Check, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LANGUAGES } from "@/lib/i18n";
import { useSettings } from "@/lib/SettingsContext";
import { cn } from "@/lib/utils";

export default function LanguagePicker() {
  const { lang, setLang, showLangPicker, closeLangPicker, t } = useSettings();

  return (
    <Dialog open={showLangPicker} onOpenChange={(open) => !open && closeLangPicker()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto rounded-3xl p-5 sm:p-7">
        <DialogHeader className="text-left">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Globe className="h-6 w-6" aria-hidden="true" />
          </div>
          <DialogTitle className="font-display text-2xl leading-tight">
            {t("c.language")}
            <span className="mt-1 block text-base font-normal text-muted-foreground">
              अपनी भाषा चुनें · ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                aria-pressed={active}
                className={cn(
                  "tap group relative flex flex-col items-start justify-center gap-0.5 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/40 hover:bg-secondary/60"
                )}
              >
                <span className="text-lg font-semibold leading-tight">{l.native}</span>
                <span className="text-xs text-muted-foreground">{l.label}</span>
                {active && (
                  <Check className="absolute right-3 top-3 h-4 w-4" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          You can change this any time from the top of the screen.
        </p>
      </DialogContent>
    </Dialog>
  );
}