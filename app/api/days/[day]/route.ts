import { NextRequest, NextResponse } from "next/server";
import { isDayOfWeek, isMoodType, MOOD_TYPES } from "@/constants/moods";
import { simulateDelay } from "../../lib/helpers";
import { getDay, setDayMood } from "../../lib/db/queries";

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

/**
 * Update the mood for one day.
 * PUT/PATCH /api/days/:day with { "mood": "happy" }
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ day: string }> }
) {
  const day = (await context.params).day.toLowerCase();
  if (!isDayOfWeek(day)) {
    return badRequest("Invalid day of week");
  }

  const body: unknown = await request.json().catch(() => null);
  const mood =
    typeof body === "object" && body !== null && "mood" in body
      ? body.mood
      : undefined;
  if (!isMoodType(mood)) {
    return badRequest(`Mood must be one of: ${MOOD_TYPES.join(", ")}`);
  }

  try {
    // Simulate server lag (300-1200ms) so the optimistic UI is visible
    await simulateDelay();
    await setDayMood(day, mood);
    const updated = await getDay(day);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating mood:", error);
    return NextResponse.json(
      { error: "Failed to update mood" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;
