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

export type CareResponse = {
    message: string;
    lowEnergyAlt?: string;
};