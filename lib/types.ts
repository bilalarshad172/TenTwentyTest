export type TimesheetStatus = "Missing" | "Incomplete" | "Complete";

export type TimesheetTask = {
  id: string;
  name: string;
  hours: number;
  project?: string;
  workType?: string;
  description?: string;
};

export type TimesheetDay = {
  date: string;
  tasks: TimesheetTask[];
};

export type TimesheetEntry = {
  id: string;
  weekNumber: number;
  weekStart: string;
  days: TimesheetDay[];
};
