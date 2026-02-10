import { NextResponse } from "next/server";
import { createTimesheet, listTimesheets } from "@/lib/timesheets-data";
import { TimesheetStatus } from "@/lib/types";

export async function GET() {
  const entries = await listTimesheets();
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const { weekNumber, date, status } = payload ?? {};

  if (
    typeof weekNumber !== "number" ||
    typeof date !== "string" ||
    !["Pending", "Submitted", "Approved"].includes(status)
  ) {
    return NextResponse.json(
      { message: "Invalid payload" },
      { status: 400 }
    );
  }

  const entry = await createTimesheet({
    weekNumber,
    date,
    status: status as TimesheetStatus,
  });

  return NextResponse.json(entry, { status: 201 });
}
