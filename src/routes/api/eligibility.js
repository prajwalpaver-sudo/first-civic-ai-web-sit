import { createFileRoute } from "@tanstack/react-router";
import { evaluateAll, groupResults } from "@/lib/eligibility";

export const Route = createFileRoute("/api/eligibility")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        if (!body || typeof body.profile !== "object" || body.profile === null) {
          return Response.json({ error: "profile_required" }, { status: 400 });
        }
        const results = evaluateAll(body.profile);
        const grouped = groupResults(results);
        const shape = (r) => ({
          id: r.id,
          name: r.scheme.name,
          status: r.status,
          reasons: r.reasons,
        });
        return Response.json({
          eligible: grouped.eligible.map(shape),
          maybe: grouped.maybe.map(shape),
          not_eligible: grouped.not.map(shape),
        });
      },
    },
  },
});