import ReactMarkdown from "react-markdown";
import { ExternalLink } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import ListenButton from "@/components/ListenButton";
import SaveButton from "@/components/SaveButton";
import { cn } from "@/lib/utils";

export default function ChatMessage({ message, index }) {
  const { t } = useSettings();
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-primary px-4 py-3 text-[1.02rem] leading-relaxed text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <span
        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground"
        aria-hidden="true"
      >
        ज
      </span>
      <div className="min-w-0 flex-1">
        <div className="rounded-3xl rounded-tl-lg border border-border bg-card px-4 py-3">
          <div className="prose-simple text-[1.02rem]">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {Array.isArray(message.citations) && message.citations.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("c.sources")}
              </p>
              <ul className="mt-1.5 space-y-1">
                {message.citations.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-start gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>
                        {c.title}
                        <span className="text-muted-foreground"> · {c.verified}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={cn("mt-2 flex flex-wrap items-center gap-2")}>
          <ListenButton text={message.content} compact />
          <SaveButton
            item={{
              id: `answer:${index}:${message.content.slice(0, 24)}`,
              type: "answer",
              title: message.content.slice(0, 80),
              text: message.content,
            }}
          />
        </div>
      </div>
    </div>
  );
}