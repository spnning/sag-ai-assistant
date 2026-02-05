// lib/types.ts

// ---------- Shared enums ----------
export type EnergyLevel = "low" | "medium" | "high";

// ---------- Domain types ----------

export type PlanBlock = {
  start: string;           // "13:00"
  end: string;             // "13:30"
  label: string;           // e.g., "Math study" or "Work shift"
  fixed?: boolean;         // OPTIONAL: fixed events like "Work 3-7"
};

export type PlanDay = {
  date: string;            // e.g., "2026-02-02"
  blocks: PlanBlock[];
};

export type PlanResponse = {
  days: PlanDay[];
  notes?: string[];
};

// Care suggestions / edits to make things gentler
export type CareEdit = {
  target?: string;         // date ("2026-01-01") or block label ("Gym")
  change: string;
  reason: string;
};

export type CareResponse = {
  gentle_summary: string;
  suggestions: string[];
  low_energy_alternatives: CareEdit[];  // renamed for clarity
};

// ---------- API contract types ----------

// 1) Chatbox -> parsed tasks/events (optional endpoint)
export type ParsedItem = {
  title: string;                 // "Work", "Gym", "COMP lab"
  type: "fixed" | "flex";        // fixed has time, flex has duration
  start?: string;                // "15:00" (24h)
  end?: string;                  // "19:00"
  durationMin?: number;          // 60, 120
  notes?: string;                // optional extra text from user
};

export type ParseRequest = {
  userInput: string;
};

export type ParseResponse = {
  items: ParsedItem[];           // normalized tasks extracted from the chatbox
};

// 2) Tasks -> scheduled plan (your "organized schedule")
export type ScheduleRequest = {
  items: ParsedItem[];
  energy: EnergyLevel;    // energy can influence intensity/breaks
  date?: string;           // OPTIONAL: for "today", could pass ISO date
};

export type ScheduleResponse = {
  plan: PlanResponse;
};

// 3) Plan -> care messaging
export type CareRequest = {
  plan: PlanResponse;
  energy: EnergyLevel;
  items?: ParsedItem[];
};

export type ApiError = {
  error: string;
};