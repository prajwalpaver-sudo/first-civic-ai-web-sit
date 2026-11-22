import { createFileRoute } from "@tanstack/react-router";
import { retrieve } from "@/lib/knowledge";
import { answerQuestion } from "@/lib/ai.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const body = await request.json().catch(() => null);
        const messages = Array.isArray(body?.messages) ? body.messages.slice(-14) : [];
        const lastUser = [...messages].reverse().find((m) => m?.role === "user");
        const question = String(lastUser?.content || "").slice(0, 4000).trim();
        if (!question) return Response.json({ error: "question_required" }, { status: 400 });

        const lang = String(body?.lang || "en").slice(0, 5);
        const simple = Boolean(body?.simple);
        const evidence = retrieve(question, 5);
        if (!evidence.length) {
          return Response.json({
            answer:
              "I could not find this in the official knowledge base. Please check the official portal or call the national helpline 1800-11-1555.",
            citations: [],
          });
        }

        const answer = await answerQuestion(context.getBase44(), {
          question,
          history: messages.slice(0, -1),
          evidence,
          lang,
          simple,
        });
        if (!answer) return Response.json({ error: "answer_failed" }, { status: 502 });

        return Response.json({
          answer,
          citations: evidence.slice(0, 4).map((e) => ({
            id: e.id,
            title: e.title,
            source_url: e.source_url,
            last_verified: e.last_verified,
          })),
        });
      },
    },
  },
});