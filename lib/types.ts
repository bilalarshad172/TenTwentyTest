export type TimesheetStatus = "Pending" | "Submitted" | "Approved";

export type TimesheetEntry = {
  id: string;
  weekNumber: number;
  date: string;
  status: TimesheetStatus;
};
