import { NextResponse } from "next/server";
import { deleteTimesheet, updateTimesheet } from "@/lib/timesheets-data";
import { TimesheetStatus } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const updated = await updateTimesheet(params.id, {
    weekNumber,
    date,
    status: status as TimesheetStatus,
  });

  if (!updated) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await deleteTimesheet(params.id);
  return NextResponse.json({ success: true });
}
