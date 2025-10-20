import { NextRequest, NextResponse } from "next/server";
import { db } from "../database";
import { Day } from "@/types/mood.types";
import { getAllDays, simulateDelay } from "../lib/helpers";

export async function GET(request: NextRequest) {
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
