import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { startListening, sttSupported } from "@/lib/speech";
import { useSettings } from "@/lib/SettingsContext";
import { cn } from "@/lib/utils";

export default function MicButton({ onText, className, label }) {
  const { t, lang } = useSettings();
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const start = () => {
    if (!sttSupported()) {
      toast.error("Voice input is not available in this browser. Please type instead.");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    setListening(true);
    recRef.current = startListening({
      langCode: lang,
      onResult: ({ final, interim, done }) => {
        const text = (final || interim || "").trim();
        if (text) onText && onText(text, done);
      },
      onError: (err) => {
        setListening(false);
        if (err === "not-allowed" || err === "service-not-allowed") {
          toast.error("Microphone permission was blocked. Allow it in your browser settings.");
        } else if (err !== "no-speech" && err !== "aborted") {
          toast.error("Could not hear you. Please try again.");
        }
      },
      onEnd: () => setListening(false),
    });
  };

  return (
    <button
      type="button"
      onClick={start}
      aria-pressed={listening}
      aria-label={label || t("a.voice")}
      title={label || t("a.voice")}
      className={cn(
        "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        listening
          ? "border-destructive bg-destructive/10 text-destructive"
          : "border-border bg-card text-foreground hover:border-primary/60",
        className
      )}
    >
      {listening && (
        <span className="absolute inset-0 animate-ping rounded-full bg-destructive/20" aria-hidden="true" />
      )}
      {listening ? (
        <Square className="relative h-5 w-5" aria-hidden="true" />
      ) : (
        <Mic className="relative h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}