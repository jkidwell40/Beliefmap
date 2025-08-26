import { AnalyzeInput, AnalyzeOutput, SuggestOutput } from "./schema";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export async function analyze(payload: unknown) {
  const parsed = AnalyzeInput.parse(payload);
  if (USE_MOCK) {
    const t = parsed.newBelief.text.toLowerCase();
    const pick = t.includes("lead") || t.includes("violence") ? "harmful"
      : t.includes("never") && t.includes("except") ? "contradictory"
      : t.includes("quantum vibes") ? "incoherent"
      : t.includes("30%") ? "pending" : "coherent";
    const mock = {
      status: pick,
      summary: "Mock evaluation for local dev.",
      fullExplanation: "This is a deterministic mock. Set VITE_USE_MOCK=0 to call the Netlify function."
    };
    return AnalyzeOutput.parse(mock);
  }
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed)
  });
  if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
  const json = await res.json();
  return AnalyzeOutput.parse(json);
}

export async function suggest(context: { coreText: string; recent: string[] }) {
  if (USE_MOCK) {
    return SuggestOutput.parse({
      suggestedBelief: "Provide universal school meals improves attendance.",
      notesHint: "Consider evidence from districts that adopted universal meals.",
      confidence: 55
    });
  }
  const res = await fetch("/api/suggest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(context)
  });
  if (!res.ok) throw new Error(`Suggest failed: ${res.status}`);
  const json = await res.json();
  return SuggestOutput.parse(json);
}
