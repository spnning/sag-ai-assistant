import { NextResponse } from "next/server";
import type { CareResponse } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();

  const careResponse = {
  gentle_summary:
    "Your plan includes a mix of priorities. Not everything needs the same level of attention, and that's okay.",

  suggestions: [
    "Start with one high-priority task and keep it small.",
    "Low-priority tasks are optional - it's okay to move or drop one.",
    "Medium-priority tasks can be done in short, flexible blocks."
  ],

  priority_based_edits: [
    {
      change: "Shrink low-priority tasks",
      reason:
        "Low-priority work should not compete with rest or high-priority deadlines."
    },
    {
      change: "Move medium-priority tasks later in the week",
      reason:
        "Spacing work out reduces pressure without sacrificing progress."
    }
  ]
};


  return NextResponse.json(careResponse);
}
