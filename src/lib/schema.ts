import { z } from "zod";

export const AnalyzeInput = z.object({
  mode: z.enum(["SANDBOX", "PROFESSIONAL"]),
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

export const AnalyzeOutput = z.object({
  status: z.enum(["coherent","contradictory","harmful","incoherent","pending"]),
  summary: z.string().max(240),
  fullExplanation: z.string().max(1200)
});

export const SuggestOutput = z.object({
  suggestedBelief: z.string().min(4).max(160),
  notesHint: z.string().min(4).max(240),
  confidence: z.number().int().min(30).max(70)
});