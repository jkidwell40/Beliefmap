import type { Handler } from "@netlify/functions";
import { z } from "zod";

const SuggestOutput = z.object({
  suggestedBelief: z.string().min(4).max(160),
  notesHint: z.string().min(4).max(240),
  confidence: z.number().int().min(30).max(70)
});

export const handler: Handler = async (event) => {
  try {
    const useMock = process.env.USE_MOCK === "1";
    const body = JSON.parse(event.body ?? "{}");
    if (useMock) {
      return ok({ suggestedBelief: "Expand targeted child benefits reduces child poverty.", notesHint: "Compare RCT/meta-analyses; consider cost-neutral options.", confidence: 60 });
    }
    // Minimal real suggestion; replace with Claude call if desired.
    return ok({ suggestedBelief: "Universal school meals improve attendance.", notesHint: "Check districts that implemented universal meals.", confidence: 55 });
  } catch (e: any) {
    return { statusCode: 400, body: JSON.stringify({ error: String(e.message ?? e) }) };
  }
};

function ok(body: unknown) {
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(SuggestOutput.parse(body)) };
}
