import { NextResponse } from "next/server";
import { createTimesheet, listTimesheets } from "@/lib/timesheets-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await listTimesheets();
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
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

  const entry = await createTimesheet({
    weekNumber,
    weekStart,
    days,
  });

  return NextResponse.json(entry, { status: 201 });
}
