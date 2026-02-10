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

export async function listTimesheets() {
  return readData();
}

export async function createTimesheet(
  data: Omit<TimesheetEntry, "id">
) {
  const entries = await readData();
  const newEntry: TimesheetEntry = { ...data, id: randomUUID() };
  entries.unshift(newEntry);
  await writeData(entries);
  return newEntry;
}

export async function updateTimesheet(
  id: string,
  data: Omit<TimesheetEntry, "id">
) {
  const entries = await readData();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) return null;

  const updated: TimesheetEntry = { ...entries[index], ...data, id };
  entries[index] = updated;
  await writeData(entries);
  return updated;
}

export async function deleteTimesheet(id: string) {
  const entries = await readData();
  const next = entries.filter((entry) => entry.id !== id);
  await writeData(next);
  return true;
}
