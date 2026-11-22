import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Paperclip, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useSettings } from "@/lib/SettingsContext";
import { detectLanguage } from "@/lib/i18n";
import { getChat, saveChat } from "@/lib/storage";
import { askAssistant, extractNoticeText } from "@/lib/server-fns";
import ChatMessage from "@/components/chat/ChatMessage";
import MicButton from "@/components/MicButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ask")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ask Civic AI — rights, schemes and notices" },
      {
        name: "description",
        content:
          "Ask about ration cards, pensions, RTI, police rights or a government notice. Answers cite official sources, by text or voice, in 12 languages.",
      },
    ],
  }),
  component: AskPage,
});

const CHIPS = [
  "How do I get a ration card?",
  "What are my rights if police stop me?",
  "My pension stopped, what do I do?",
  "How do I file an RTI application?",
  "What does this notice mean?",
];

function AskPage() {
  const { t, lang, setLang } = useSettings();
  const askFn = useServerFn(askAssistant);
  const ocrFn = useServerFn(extractNoticeText);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [simple, setSimple] = useState(false);
  const [uploading, setUploading] = useState(false);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    setMessages(getChat());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const persist = (list) => {
    setMessages(list);
    saveChat(list);
  };

  const send = async (raw) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;

    const detected = detectLanguage(text);
    const replyLang = detected || lang;

    const withUser = [...messages, { role: "user", content: text }];
    persist(withUser);
    setInput("");
    setBusy(true);

    try {
      const res = await askFn({
        data: { messages: withUser.slice(-10), lang: replyLang, simple },
      });
      const answer = res.answer || "Sorry, I could not answer right now.";
      persist([...withUser, { role: "assistant", content: answer, citations: res.citations || [] }]);
    } catch {
      persist([
        ...withUser,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again in a moment.",
          citations: [],
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri,
        expires_in: 900,
      });
      const res = await ocrFn({ data: { fileUrl: signed_url } });
      if (res.ok && res.text) {
        setInput((prev) => `${prev ? `${prev}\n\n` : ""}${res.text}`.slice(0, 3800));
        toast.success("Text read from the document. Press send to ask about it.");
      } else {
        toast.error("Could not read that file. Please try a clearer photo.");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const newChat = () => {
    persist([]);
    setInput("");
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-3xl flex-col px-4 pb-4 pt-5 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold leading-tight">{t("a.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("a.sub")}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSimple((v) => !v)}
            aria-pressed={simple}
            className={cn(
              "rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
              simple
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50"
            )}
          >
            <Sparkles className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
            {t("a.simple")}
          </button>
          <button
            type="button"
            onClick={newChat}
            aria-label={t("a.new")}
            title={t("a.new")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">{t("home.c3.t")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => send(c)}
                  className="rounded-full border border-border bg-background px-3.5 py-2 text-left text-sm font-medium transition-colors hover:border-primary/50"
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("c.indicative")}</p>
          </div>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={`${m.role}-${i}`} message={m} index={i} />
        ))}

        {busy && (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t("a.thinking")}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-16 mt-4 rounded-3xl border-2 border-border bg-card p-2 md:bottom-4">
        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={onFile}
            className="hidden"
            id="chat-file"
          />
          <label
            htmlFor="chat-file"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label={t("c.upload")}
            title={t("c.upload")}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Paperclip className="h-5 w-5" aria-hidden="true" />
            )}
          </label>

          <label htmlFor="chat-input" className="sr-only">
            {t("a.placeholder")}
          </label>
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t("a.placeholder")}
            className="max-h-32 min-h-[2.75rem] flex-1 resize-y rounded-2xl border border-border bg-background px-3 py-2.5 text-[1rem] outline-none focus:border-primary"
          />

          <MicButton
            onText={(text, done) => {
              setInput(text);
              if (done) setTimeout(() => send(text), 250);
            }}
          />

          <button
            type="button"
            onClick={() => send()}
            disabled={busy || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
            aria-label={t("a.send")}
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className="mt-2 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
        {t("c.indicative")} · NALSA 15100 · Cyber fraud 1930
      </p>
    </div>
  );
}