import { NextResponse } from "next/server";
import { simulateDelay } from "../lib/helpers";
import { getAllDays } from "../lib/db/queries";

export async function GET() {
  try {
    await simulateDelay();
    const days = await getAllDays();
    return NextResponse.json(days);
  } catch (error) {
    console.error("Error fetching days:", error);
    return NextResponse.json(
      { error: "Failed to fetch days" },
      { status: 500 }
    );
  }
}
