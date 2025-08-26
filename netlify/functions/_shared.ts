import { z } from "zod";

export const AnalyzeOutput = z.object({
  status: z.enum(["coherent","contradictory","harmful","incoherent","pending"]),
  summary: z.string(),
  fullExplanation: z.string()
});

export function analyzeSystemPrompt() {
  return `
You are an epistemic consistency checker for a belief-mapping app.

Your job:
1) Evaluate a NEW belief relative to a FIXED core belief and its upstream chain.
2) Decide one status: coherent | contradictory | harmful | incoherent | pending.
3) Provide a concise TL;DR and a short explanation with concrete remediation if flagged.

Rules:
- Treat the core belief as epistemically protected: do NOT critique or flag it.
- Status precedence: harmful > contradictory > incoherent > coherent; if uncertain, pending.
- "Harm" includes physical and systemic harm grounded in mainstream evidence/consensus.
- Use mainstream peer-reviewed or widely accepted consensus when facts matter. If unclear and decisive, return "pending" and state what would resolve it.
- Mode awareness:
  - PROFESSIONAL: If flagged, give the single most actionable change to notes/qualifiers to remove the flag.
  - SANDBOX: If flagged, provide 1–2 refinement options; do not soften the judgment.
- Return ONLY strict JSON with keys: status, summary, fullExplanation.
- TL;DR ≤ 40 words; explanation ≤ ~180 words. No bullet lists; no analysis steps.
`.trim();
}

export function buildAnalyzeUserPrompt(payload: any) {
  const { mode, coreBelief, upstreamBeliefs, newBelief } = payload;
  return `
MODE: ${mode}

CORE BELIEF (protected):
- text: ${coreBelief.text}
- notes: ${coreBelief.notes ?? ""}
- confidence: ${coreBelief.confidence}

UPSTREAM (core → parent):
${upstreamBeliefs.map((u:any)=>`- belief: ${u.text}
  notes: ${u.notes ?? ""}
  confidence: ${u.confidence}
  status: ${u.status}`).join("\n")}

NEW BELIEF:
- belief: ${newBelief.text}
- notes: ${newBelief.notes ?? ""}
- confidence: ${newBelief.confidence}

Task: Evaluate ONLY the NEW belief against the upstream chain and core. Apply the rules and return the JSON object with fields: status, summary, fullExplanation.
`.trim();
}

export async function anthropicMessages(system: string, user: string) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY is not set");
  const model = process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-20240620";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      temperature: 0,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
  const data = await res.json();
  const text = (data?.content?.[0]?.text ?? "").trim();
  return text;
}
