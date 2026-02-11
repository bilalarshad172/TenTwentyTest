import dayjs from "dayjs";
import type { TimesheetEntry, TimesheetStatus } from "@/lib/types";

export const TARGET_WEEK_HOURS = 40;

export function getTotalHours(entry: TimesheetEntry) {
  return entry.days.reduce(
    (weekSum, day) =>
      weekSum +
      day.tasks.reduce((daySum, task) => daySum + Number(task.hours), 0),
    0
  );
}

export function getStatus(totalHours: number): TimesheetStatus {
  if (totalHours === 0) return "Missing";
  if (totalHours >= TARGET_WEEK_HOURS) return "Complete";
  return "Incomplete";
}

export function formatWeekRange(weekStart: string) {
  const start = dayjs(weekStart);
  const end = start.add(4, "day");
  if (start.month() === end.month()) {
    return `${start.format("D")} - ${end.format("D MMMM, YYYY")}`;
  }
  return `${start.format("D MMMM")} - ${end.format("D MMMM, YYYY")}`;
}

export function getWeekEnd(weekStart: string) {
  return dayjs(weekStart).add(4, "day");
}
