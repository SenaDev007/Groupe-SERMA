import { WORK_PRIORITIES } from "./constants";

const PRIORITY_LABELS: Record<string, string> = Object.fromEntries(
  WORK_PRIORITIES.map((p) => [p.value, p.label])
);

export function priorityLabel(priority: string): string {
  return PRIORITY_LABELS[priority] ?? priority;
}
