import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { AnalyzeOutput, analyzeSystemPrompt, buildAnalyzeUserPrompt, anthropicMessages } from "./_shared";

const AnalyzeInput = z.object({
  mode: z.enum(["SANDBOX","PROFESSIONAL"]),
  coreBelief: z.object({
    text: z.string().min(1).max(600),
    notes: z.string().optional(),
    confidence: z.number().int().min(0).max(100)
  }),
  upstreamBeliefs: z.array(z.object({
    text: z.string().min(1).max(600),
    notes: z.string().optional(),
    confidence: z.number().int().min(0).max(100),
    status: z.enum(["coherent","contradictory","harmful","incoherent","pending","protected"])
  })).max(50),
  newBelief: z.object({
    text: z.string().min(1).max(600),
    notes: z.string().optional(),
    confidence: z.number().int().min(0).max(100)
  })
});

export const handler: Handler = async (event) => {
  try {
    const useMock = process.env.USE_MOCK === "1";
    const body = JSON.parse(event.body ?? "{}");
    const parsed = AnalyzeInput.parse(body);

    if (useMock) {
      const t = parsed.newBelief.text.toLowerCase();
      const pick = t.includes("lead") || t.includes("violence") ? "harmful"
        : t.includes("never") && t.includes("except") ? "contradictory"
        : t.includes("quantum vibes") ? "incoherent"
        : t.includes("30%") ? "pending" : "coherent";
      const mock = { status: pick, summary: "Mock result.", fullExplanation: "Set USE_MOCK=0 to use Claude." };
      return resp(200, mock);
    }

    const sys = analyzeSystemPrompt();
    const usr = buildAnalyzeUserPrompt(parsed);
    const raw = await anthropicMessages(sys, usr);

    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd < 0) throw new Error("No JSON in model response");
    const obj = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    const valid = AnalyzeOutput.parse(obj);
    return resp(200, valid);
  } catch (err: any) {
    return resp(400, { error: String(err?.message ?? err) });
  }
};

function resp(statusCode: number, body: unknown) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}
