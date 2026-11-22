import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export default function AskFab() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/ask")) return null;

  return (
    <Link
      to="/ask"
      aria-label="Ask Civic AI"
      className="fixed bottom-[5.5rem] right-4 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-0.5 md:bottom-6 md:right-6"
    >
      <Sparkles className="h-5 w-5" aria-hidden="true" />
      <span>Ask Civic AI</span>
    </Link>
  );
}