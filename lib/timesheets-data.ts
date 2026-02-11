import { promises as fs } from "fs";
import path from "path";
import { TimesheetEntry } from "@/lib/types";
import { randomUUID } from "crypto";

const dataPath = path.join(process.cwd(), "data", "timesheets.json");

async function readData(): Promise<TimesheetEntry[]> {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    return JSON.parse(raw) as TimesheetEntry[];
  } catch {
    return [];
  }
}

async function writeData(entries: TimesheetEntry[]) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(entries, null, 2), "utf-8");
}

function normalizeEntry(entry: TimesheetEntry): TimesheetEntry {
  return {
    ...entry,
    days: entry.days.map((day) => ({
      ...day,
      tasks: day.tasks.map((task) => ({
        ...task,
        hours: Number(task.hours),
      })),
    })),
  };
}

function getTotalHours(entry: TimesheetEntry) {
  return entry.days.reduce(
    (weekSum, day) =>
      weekSum +
      day.tasks.reduce((daySum, task) => daySum + Number(task.hours), 0),
    0
  );
}

function getTotalTasks(entry: TimesheetEntry) {
  return entry.days.reduce((sum, day) => sum + day.tasks.length, 0);
}

function buildFallbackId(entry: TimesheetEntry, used: Set<string>) {
  const base = `w${entry.weekNumber}`;
  if (!used.has(base)) return base;
  const withDate = `w${entry.weekNumber}-${entry.weekStart}`;
  if (!used.has(withDate)) return withDate;
  let counter = 1;
  while (used.has(`${withDate}-${counter}`)) counter += 1;
  return `${withDate}-${counter}`;
}

function sanitizeEntries(entries: TimesheetEntry[]) {
  const normalized = entries.map(normalizeEntry);
  const byWeek = new Map<string, TimesheetEntry>();
  for (const entry of normalized) {
    const key = `${entry.weekNumber}-${entry.weekStart}`;
    const existing = byWeek.get(key);
    if (!existing) {
      byWeek.set(key, entry);
      continue;
    }
    const existingHours = getTotalHours(existing);
    const nextHours = getTotalHours(entry);
    if (nextHours > existingHours) {
      byWeek.set(key, entry);
      continue;
    }
    if (nextHours === existingHours) {
      const existingTasks = getTotalTasks(existing);
      const nextTasks = getTotalTasks(entry);
      if (nextTasks > existingTasks) {
        byWeek.set(key, entry);
      }
    }
  }

  const usedIds = new Set<string>();
  const deduped = Array.from(byWeek.values()).map((entry) => {
    if (!entry.id || usedIds.has(entry.id)) {
      const fallback = buildFallbackId(entry, usedIds);
      usedIds.add(fallback);
      return { ...entry, id: fallback };
    }
    usedIds.add(entry.id);
    return entry;
  });

  return deduped;
}

function entriesEqual(a: TimesheetEntry[], b: TimesheetEntry[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export async function listTimesheets() {
  const entries = await readData();
  const sanitized = sanitizeEntries(entries);
  if (!entriesEqual(entries, sanitized)) {
    await writeData(sanitized);
  }
  return sanitized;
}

export async function getTimesheet(id: string) {
  const entries = await readData();
  const sanitized = sanitizeEntries(entries);
  if (!entriesEqual(entries, sanitized)) {
    await writeData(sanitized);
  }
  const foundById = sanitized.find((entry) => entry.id === id);
  if (foundById) return foundById;

  const normalizedId = id.trim();
  const weekNumberMatch = normalizedId.match(/^w(\d+)$/i);
  const weekNumber = weekNumberMatch
    ? Number(weekNumberMatch[1])
    : Number.isFinite(Number(normalizedId))
      ? Number(normalizedId)
      : null;

  if (weekNumber !== null) {
    const byWeek = sanitized.find((entry) => entry.weekNumber === weekNumber);
    if (byWeek) return byWeek;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedId)) {
    const byStart = sanitized.find(
      (entry) => entry.weekStart === normalizedId
    );
    if (byStart) return byStart;
  }

  return null;
}

export async function createTimesheet(
  data: Omit<TimesheetEntry, "id">
) {
  const entries = await readData();
  const newEntry: TimesheetEntry = normalizeEntry({
    ...data,
    id: randomUUID(),
  });
  const next = sanitizeEntries([newEntry, ...entries]);
  await writeData(next);
  return newEntry;
}

export async function updateTimesheet(
  id: string,
  data: Omit<TimesheetEntry, "id">
) {
  const entries = await readData();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) {
    const fallbackIndex = entries.findIndex(
      (entry) =>
        entry.weekNumber === data.weekNumber &&
        entry.weekStart === data.weekStart
    );
    if (fallbackIndex !== -1) {
      const existing = entries[fallbackIndex];
      const updated: TimesheetEntry = normalizeEntry({
        ...existing,
        ...data,
        id: existing.id,
      });
      entries[fallbackIndex] = updated;
      const next = sanitizeEntries(entries);
      await writeData(next);
      return updated;
    }
    const created: TimesheetEntry = normalizeEntry({ ...data, id });
    const next = sanitizeEntries([created, ...entries]);
    await writeData(next);
    return created;
  }

  const updated: TimesheetEntry = normalizeEntry({
    ...entries[index],
    ...data,
    id,
  });
  entries[index] = updated;
  const next = sanitizeEntries(entries);
  await writeData(next);
  return updated;
}

export async function deleteTimesheet(id: string) {
  const entries = await readData();
  const next = entries.filter((entry) => entry.id !== id);
  await writeData(next);
  return true;
}
