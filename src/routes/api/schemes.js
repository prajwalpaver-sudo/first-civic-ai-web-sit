import { createFileRoute } from "@tanstack/react-router";
import { schemes } from "@/lib/eligibility";

export const Route = createFileRoute("/api/schemes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (id) {
          const scheme = schemes.find((s) => s.id === id);
          if (!scheme) return Response.json({ error: "not_found" }, { status: 404 });
          return Response.json({ scheme });
        }
        return Response.json({
          count: schemes.length,
          schemes: schemes.map((s) => ({
            id: s.id,
            name: s.name,
            full_name: s.full_name,
            category: s.category,
            level: s.level,
            states: s.states,
            summary: s.summary,
            benefit: s.benefit,
            source_url: s.source_url,
            last_verified: s.last_verified,
          })),
        });
      },
    },
  },
});