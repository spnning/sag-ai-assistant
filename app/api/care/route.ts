import { NextResponse } from "next/server";
import type { CareResponse, CareRequest, ParsedItem } from "@/lib/types";

export async function POST(req: Request) {
  // Expecting: { plan, energy, items? } per your CareRequest type
  const body = (await req.json()) as CareRequest;

  const energy = body.energy;
  const items: ParsedItem[] = body.items ?? [];

  const fixedCount = items.filter((i) => i.type === "fixed").length;
  const flexCount = items.filter((i) => i.type === "flex").length;
  const totalCount = fixedCount + flexCount;

  // Gentle summary (rules-based)
  let gentle_summary = "You've got a plan — and you don't need to do it perfectly for it to count.";
  if (energy === "low") {
    gentle_summary = "Low-energy days count too. Keeping it small and kind is still progress.";
  } else if (totalCount >= 6) {
    gentle_summary = "This looks like a full day. It's okay to focus on what matters most and let the rest be flexible.";
  } else if (fixedCount >= 2) {
    gentle_summary = "You already have a couple fixed commitments — protecting your energy around them is a good call.";
  }

  // Suggestions (also rules-based)
  const suggestions: string[] = [];

  if (energy === "low") {
    suggestions.push("Pick 1 'anchor' task and let everything else be optional.");
    suggestions.push("Aim for a 10-20 minute starter session rather than a full grind.");
    suggestions.push("If you're running out of steam, swap a flex task for rest without guilt.");
  } else if (energy === "high") {
    suggestions.push("Start with the smallest first step to build momentum.");
    suggestions.push("Batch similar tasks together so transitions feel easier.");
    suggestions.push("Add short breaks between blocks to avoid burnout later.");
  } else {
    suggestions.push("Start with one important task and keep the first block short.");
    suggestions.push("Treat 'nice-to-do' tasks as flexible — move them if pressure rises.");
    suggestions.push("Take a quick break after each block to reset.");
  }

  // Low-energy alternatives: only populate when energy is low (otherwise keep it empty)
  const low_energy_alternatives = [];

  if (energy === "low") {
    // Suggest shrinking the first flex item, if it exists
    const firstFlex = items.find((i) => i.type === "flex");
    if (firstFlex) {
      low_energy_alternatives.push({
        target: firstFlex.title,
        change: "Shrink this to a 15-20 minute starter session",
        reason: "Starting small reduces pressure and still moves things forward.",
      });
    }

    low_energy_alternatives.push({
      target: "today",
      change: "Limit today to 1-2 focus blocks total",
      reason: "Low-energy days prioritize recovery and sustainability.",
    });
  }

  const careResponse: CareResponse = {
    gentle_summary,
    suggestions,
    low_energy_alternatives,
  };

  return NextResponse.json(careResponse);
}
