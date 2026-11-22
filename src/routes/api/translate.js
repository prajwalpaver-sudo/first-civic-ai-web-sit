import { createFileRoute } from "@tanstack/react-router";
import { translateText } from "@/lib/ai.server";

export const Route = createFileRoute("/api/translate")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const body = await request.json().catch(() => null);
        const text = String(body?.text || "").slice(0, 4000).trim();
        const targetLang = String(body?.target_lang || body?.targetLang || "hi").slice(0, 5);
        if (!text) return Response.json({ error: "text_required" }, { status: 400 });
        const translated = await translateText(context.getBase44(), { text, lang: targetLang });
        if (!translated) return Response.json({ error: "translation_failed" }, { status: 502 });
        return Response.json({ text: translated, target_lang: targetLang });
      },
    },
  },
});