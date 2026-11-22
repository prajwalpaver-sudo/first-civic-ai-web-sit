import { createFileRoute } from "@tanstack/react-router";
import { ocrDocument } from "@/lib/ai.server";

export const Route = createFileRoute("/api/ocr")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const body = await request.json().catch(() => null);
        const fileUrl = String(body?.fileUrl || "").slice(0, 2000);
        if (!fileUrl) return Response.json({ error: "fileUrl_required" }, { status: 400 });
        const text = await ocrDocument(context.getBase44(), fileUrl);
        return Response.json({ text });
      },
    },
  },
});