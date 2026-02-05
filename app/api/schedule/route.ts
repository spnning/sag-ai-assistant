import { NextResponse } from "next/server";
import type {
  ScheduleRequest,
  ScheduleResponse,
  ParsedItem,
  PlanBlock,
  PlanResponse,
  EnergyLevel,
} from "@/lib/types";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function flexCapMinutes(energy: EnergyLevel): number {
  if (energy === "low") return 120;
  if (energy === "medium") return 240;
  return 360;
}

function buildPlan(items: ParsedItem[], energy: EnergyLevel, dateISO: string): PlanResponse {
  const DAY_START = toMinutes("09:00");
  const DAY_END = toMinutes("21:00");

  // 1) Separate fixed and flex
  const fixed: PlanBlock[] = items
    .filter((i) => i.type === "fixed" && i.start && i.end)
    .map((i) => ({
      start: i.start!,
      end: i.end!,
      label: i.title,
      fixed: true,
    }))
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const flex = items.filter((i) => i.type === "flex" && typeof i.durationMin === "number");

  // 2) Build open windows between fixed blocks
  const windows: Array<{ start: number; end: number }> = [];
  let cursor = DAY_START;

  for (const b of fixed) {
    const s = toMinutes(b.start);
    const e = toMinutes(b.end);

    if (cursor < s) windows.push({ start: cursor, end: s });
    cursor = Math.max(cursor, e);
  }
  if (cursor < DAY_END) windows.push({ start: cursor, end: DAY_END });

  // 3) Fill windows with flex tasks
  const blocks: PlanBlock[] = [...fixed];
  const cap = flexCapMinutes(energy);
  let used = 0;
  let flexIndex = 0;

  const BREAK_MIN = energy === "low" ? 15 : 10;

  for (const w of windows) {
    let t = w.start;

    while (t < w.end && flexIndex < flex.length && used < cap) {
      const item = flex[flexIndex];
      const requested = item.durationMin ?? 60;

      const remainingWindow = w.end - t;
      const remainingCap = cap - used;
      const dur = Math.min(requested, remainingWindow, remainingCap);

      if (dur < 15) break;

      blocks.push({
        start: toHHMM(t),
        end: toHHMM(t + dur),
        label: item.title,
        fixed: false,
      });

      used += dur;
      t += dur + BREAK_MIN;
      flexIndex++;
    }
  }

  // 4) Sort blocks chronologically
  blocks.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const notes: string[] = [];
  if (energy === "low") notes.push("Kept the plan lighter and added extra breathing room.");
  if (flexIndex < flex.length) {
    notes.push("Some flexible tasks were left unscheduled — it’s okay to carry them forward.");
  }

  return { days: [{ date: dateISO, blocks }], notes: notes.length ? notes : undefined };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ScheduleRequest;

    if (!body?.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Missing items[]" }, { status: 400 });
    }
    if (!body?.energy) {
      return NextResponse.json({ error: "Missing energy" }, { status: 400 });
    }

    const dateISO = body.date ?? new Date().toISOString().slice(0, 10);

    const plan = buildPlan(body.items, body.energy, dateISO);

    const resp: ScheduleResponse = { plan };
    return NextResponse.json(resp);
  } catch (err) {
    return NextResponse.json({ error: "Failed to build schedule" }, { status: 500 });
  }
}
