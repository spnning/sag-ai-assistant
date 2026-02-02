// lib/types.ts

export type PriorityLevel = "low" | "medium" | "high";

export type Task = {
    id: string;
    title: string;
    dueDate: string;
    estimateTime: number;
};

export type PlanBlock = {
    start: string;          // ex. "13:00"
    end: string;            // ex. "13:30"
    label: string;
    taskId?: string;
};

export type PlanDay = {
    date: string;
    blocks: PlanBlock[];
};

export type PlanResponse = {
    days: PlanDay[];
    notes?: string[];
};

export type CareEdit = {
    taskId?: string;           // ex. "today" or "2026-02-02"
    change: string;         // what to do
    reason: string;         // why
}

export type CareResponse = {
    gentle_summary: string;
    suggestions: string[];
    priority_based_edits: CareEdit[];
};