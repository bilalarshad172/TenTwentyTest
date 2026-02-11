import { NextResponse } from "next/server";
import {
  deleteTimesheet,
  getTimesheet,
  updateTimesheet,
} from "@/lib/timesheets-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const payload = await request.json();
  const { weekNumber, weekStart, days } = payload ?? {};

  if (
    typeof weekNumber !== "number" ||
    typeof weekStart !== "string" ||
    !Array.isArray(days)
  ) {
    return NextResponse.json(
      { message: "Invalid payload" },
      { status: 400 }
    );
  }

  const updated = await updateTimesheet(params.id, {
    weekNumber,
    weekStart,
    days,
  });

  if (!updated) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const entry = await getTimesheet(params.id);
  if (!entry) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(entry);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await deleteTimesheet(params.id);
  return NextResponse.json({ success: true });
}
