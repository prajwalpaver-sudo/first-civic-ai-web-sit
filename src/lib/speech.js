import { languageByCode } from "@/lib/i18n";

/* ---------------- Text to speech ---------------- */

// Pluggable adapter. To add Bhashini or Google Cloud TTS, implement the same
// shape (speak / stop / supported) and swap it in with setTtsAdapter().
export const browserTtsAdapter = {
  supported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  },
  speak(text, langCode, onEnd) {
    if (!this.supported()) return false;
    const synth = window.speechSynthesis;
    synth.cancel();
    const clean = String(text || "")
      .replace(/[#*_`>]/g, " ")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\s+/g, " ")
      .slice(0, 3500);
    if (!clean) return false;
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = languageByCode(langCode).bcp47;
    utter.rate = 0.95;
    utter.pitch = 1;
    const match = (synth.getVoices() || []).find(
      (v) => v.lang && v.lang.toLowerCase().startsWith(languageByCode(langCode).bcp47.slice(0, 2).toLowerCase())
    );
    if (match) utter.voice = match;
    utter.onend = () => onEnd && onEnd();
    utter.onerror = () => onEnd && onEnd();
    synth.speak(utter);
    return true;
  },
  stop() {
    if (this.supported()) window.speechSynthesis.cancel();
  },
};

let adapter = browserTtsAdapter;

export function setTtsAdapter(next) {
  adapter = next;
}

export function ttsSupported() {
  return adapter.supported();
}

export function speak(text, langCode, onEnd) {
  return adapter.speak(text, langCode, onEnd);
}

export function stopSpeaking() {
  adapter.stop();
}

/* ---------------- Speech to text ---------------- */

export function sttSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startListening({ langCode, onResult, onError, onEnd }) {
  if (!sttSupported()) {
    onError && onError("unsupported");
    return null;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new Recognition();
  rec.lang = languageByCode(langCode).bcp47;
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  let finalText = "";

  rec.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += transcript;
      else interim += transcript;
    }
    onResult && onResult({ final: finalText, interim, done: false });
  };
  rec.onerror = (event) => {
    onError && onError(event.error || "error");
  };
  rec.onend = () => {
    onResult && onResult({ final: finalText, interim: "", done: true });
    onEnd && onEnd(finalText);
  };

  try {
    rec.start();
  } catch {
    onError && onError("start_failed");
    return null;
  }

  return {
    stop() {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}