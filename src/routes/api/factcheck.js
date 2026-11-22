import { createFileRoute } from "@tanstack/react-router";
import { retrieve } from "@/lib/knowledge";
import { judgeClaim, ocrDocument, detectRedFlags } from "@/lib/ai.server";

export const Route = createFileRoute("/api/factcheck")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const body = await request.json().catch(() => null);
        if (!body) return Response.json({ error: "invalid_json" }, { status: 400 });

        const base44 = context.getBase44();
        const lang = String(body.lang || "en").slice(0, 5);
        let claim = String(body.text || "").slice(0, 6000).trim();
        if (!claim && body.fileUrl) claim = await ocrDocument(base44, String(body.fileUrl).slice(0, 2000));
        if (!claim) return Response.json({ error: "text_or_file_required" }, { status: 400 });

        const evidence = retrieve(claim, 5);
        const autoFlags = detectRedFlags(claim);
        if (!evidence.length) {
          return Response.json({
            verdict: "cant_verify",
            reasoning: "No official source in the knowledge base covers this claim.",
            evidence: [],
            red_flags: autoFlags.map((f) => f.label),
          });
        }

        const judged = await judgeClaim(base44, { claim, evidence, lang, autoFlags });
        if (!judged) return Response.json({ error: "check_failed" }, { status: 502 });

        const validIds = new Set(evidence.map((e) => e.id));
        const used = (judged.evidence_ids || [])
          .filter((id) => validIds.has(id))
          .map((id) => evidence.find((e) => e.id === id))
          .filter(Boolean);

        return Response.json({
          verdict: judged.verdict,
          claim: judged.claim_summary,
          reasoning: judged.reasoning,
          what_to_do: judged.what_to_do,
          evidence: used.map((e) => ({
            id: e.id,
            title: e.title,
            source_url: e.source_url,
            last_verified: e.last_verified,
          })),
          red_flags: judged.red_flags || autoFlags.map((f) => f.label),
        });
      },
    },
  },
});