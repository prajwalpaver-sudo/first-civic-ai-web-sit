import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { evaluateAll, groupResults, getScheme } from "@/lib/eligibility";
import { retrieve } from "@/lib/knowledge";
import {
  judgeClaim,
  answerQuestion,
  translateText as translateWithLlm,
  explainMatches,
  ocrDocument,
  detectRedFlags,
} from "@/lib/ai.server";

const profileSchema = z.object({
  age: z.number().min(0).max(120).nullable().optional(),
  gender: z.enum(["female", "male", "other"]).nullable().optional(),
  state: z.string().max(80).nullable().optional(),
  area: z.enum(["rural", "urban"]).nullable().optional(),
  income: z.number().min(0).max(100000000).nullable().optional(),
  occupation: z
    .enum(["farmer", "student", "worker", "business", "homemaker", "unemployed", "retired"])
    .nullable()
    .optional(),
  caste: z.enum(["sc", "st", "obc", "general"]).nullable().optional(),
  disability: z.boolean().nullable().optional(),
  bpl: z.boolean().nullable().optional(),
  land: z.boolean().nullable().optional(),
});

const langSchema = z.string().max(5).default("en");

/* Deterministic eligibility matching — no AI involved. */
export const checkEligibility = createServerFn({ method: "POST" })
  .validator(z.object({ profile: profileSchema }))
  .handler(async ({ data }) => {
    const results = evaluateAll(data.profile || {});
    const grouped = groupResults(results);
    const shape = (r) => ({ id: r.id, status: r.status, reasons: r.reasons });
    return {
      eligible: grouped.eligible.map(shape),
      maybe: grouped.maybe.map(shape),
      not: grouped.not.map(shape),
    };
  });

/* Explain the deterministic result in the user's language. */
export const explainResults = createServerFn({ method: "POST" })
  .validator(
    z.object({
      profile: profileSchema,
      ids: z.array(z.string().max(60)).max(20),
      lang: langSchema,
      simple: z.boolean().optional().default(false),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const results = evaluateAll(data.profile || {});
    const chosen = results.filter((r) => data.ids.includes(r.id)).slice(0, 12);
    if (!chosen.length) return { ok: false, intro: "", items: [] };

    const explained = await explainMatches(base44, {
      profile: data.profile || {},
      matches: chosen,
      lang: data.lang,
      simple: data.simple,
    });
    if (!explained) return { ok: false, intro: "", items: [] };

    const validIds = new Set(chosen.map((c) => c.id));
    return {
      ok: true,
      intro: explained.intro || "",
      items: (explained.items || []).filter((i) => validIds.has(i.id)),
    };
  });

/* OCR: pull the text out of a notice photo or PDF. */
export const extractNoticeText = createServerFn({ method: "POST" })
  .validator(z.object({ fileUrl: z.string().max(2000) }))
  .handler(async ({ data, context }) => {
    const text = await ocrDocument(context.getBase44(), data.fileUrl);
    return { ok: Boolean(text), text: text.slice(0, 6000) };
  });

/* Fact check a claim or a notice against the official knowledge base. */
export const factCheck = createServerFn({ method: "POST" })
  .validator(
    z.object({
      text: z.string().max(6000).nullable().optional(),
      fileUrl: z.string().max(2000).nullable().optional(),
      lang: langSchema,
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    let claim = (data.text || "").trim();
    if (!claim && data.fileUrl) claim = await ocrDocument(base44, data.fileUrl);
    claim = claim.slice(0, 6000);

    if (!claim) {
      return { ok: false, error: "no_input", verdict: "cant_verify", evidence: [], red_flags: [] };
    }

    const evidence = retrieve(claim, 5);
    const autoFlags = detectRedFlags(claim);

    if (!evidence.length) {
      return {
        ok: true,
        verdict: "cant_verify",
        claim,
        reasoning:
          "I could not find this claim in my official sources, so I cannot say whether it is true. Please check the department's official website or call the helpline before acting on it.",
        what_to_do: "Do not pay money or share an OTP. Confirm with the office named in the message.",
        evidence: [],
        red_flags: autoFlags.map((f) => f.label),
      };
    }

    const judged = await judgeClaim(base44, { claim, evidence, lang: data.lang, autoFlags });
    if (!judged) {
      return {
        ok: true,
        verdict: "cant_verify",
        claim,
        reasoning:
          "The check could not be completed right now. Please try again in a moment, or verify directly on the official website.",
        what_to_do: "Do not pay money or share an OTP until you confirm.",
        evidence: evidence.slice(0, 3),
        red_flags: autoFlags.map((f) => f.label),
      };
    }

    const validIds = new Set(evidence.map((e) => e.id));
    const usedEvidence = (judged.evidence_ids || [])
      .filter((id) => validIds.has(id))
      .map((id) => evidence.find((e) => e.id === id))
      .filter(Boolean);

    let verdict = judged.verdict;
    if (verdict === "verified" && usedEvidence.length === 0) verdict = "cant_verify";

    const flags = Array.from(
      new Set([...(judged.red_flags || []), ...autoFlags.map((f) => f.label)].filter(Boolean))
    ).slice(0, 6);

    return {
      ok: true,
      verdict,
      claim: judged.claim_summary || claim.slice(0, 400),
      reasoning: judged.reasoning || "",
      what_to_do: judged.what_to_do || "",
      evidence: usedEvidence.length ? usedEvidence : evidence.slice(0, 2),
      red_flags: flags,
    };
  });

/* Grounded assistant chat. */
export const askAssistant = createServerFn({ method: "POST" })
  .validator(
    z.object({
      messages: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
        .min(1)
        .max(14),
      lang: langSchema,
      simple: z.boolean().optional().default(false),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");
    const question = (lastUser?.content || "").trim().slice(0, 4000);
    if (!question) return { ok: false, answer: "", citations: [] };

    const evidence = retrieve(question, 5);
    if (!evidence.length) {
      return {
        ok: true,
        answer:
          "I could not find this in my official sources, so I do not want to guess. Please ask the office or helpline for this service, or call the national helpline 1800-11-1555. For free legal help call NALSA on 15100.",
        citations: [],
      };
    }

    const answer = await answerQuestion(base44, {
      question,
      history: data.messages.slice(0, -1),
      evidence,
      lang: data.lang,
      simple: data.simple,
    });

    if (!answer) {
      return {
        ok: false,
        answer: "Sorry, I could not answer right now. Please try again in a moment.",
        citations: [],
      };
    }

    return {
      ok: true,
      answer,
      citations: evidence.slice(0, 4).map((e) => ({
        id: e.id,
        title: e.title,
        url: e.source_url,
        verified: e.last_verified,
      })),
    };
  });

/* Translate a piece of scheme content on demand. */
export const translateContent = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().max(4000), targetLang: langSchema }))
  .handler(async ({ data, context }) => {
    const text = await translateWithLlm(context.getBase44(), {
      text: data.text,
      lang: data.targetLang,
    });
    return { ok: Boolean(text), text };
  });

/* Save a scam report for the operator to review. */
export const reportScam = createServerFn({ method: "POST" })
  .validator(
    z.object({
      claim: z.string().max(2000),
      verdict: z.string().max(40),
      note: z.string().max(1000).optional(),
      language: z.string().max(5).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    await base44.entities.ScamReport.create({
      claim: data.claim.slice(0, 2000),
      verdict: data.verdict.slice(0, 40),
      note: (data.note || "").slice(0, 1000),
      language: data.language || "en",
    });
    return { ok: true };
  });

/* Convenience for the scheme detail page. */
export const schemeById = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().max(60) }))
  .handler(async ({ data }) => getScheme(data.id));