import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { speak, stopSpeaking, ttsSupported } from "@/lib/speech";
import { useSettings } from "@/lib/SettingsContext";
import { cn } from "@/lib/utils";

export default function ListenButton({ text, className, compact = false }) {
  const { t, lang } = useSettings();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const started = speak(text, lang, () => setSpeaking(false));
    setSpeaking(Boolean(started));
  };

  if (!ttsSupported()) {
    return (
      <span className="text-xs text-muted-foreground" title="Your browser does not support voice output">
        🔊 {t("c.listen")} — not available on this device
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold transition-colors hover:border-primary/50",
        speaking && "border-primary bg-primary/10 text-primary",
        className
      )}
    >
      {speaking ? (
        <Square className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      )}
      {speaking ? t("c.stop") : compact ? t("c.listen") : `🔊 ${t("c.listen")}`}
    </button>
  );
}