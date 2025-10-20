import { NextRequest, NextResponse } from "next/server";
import { DayOfWeek } from "@/types/mood.types";
import { DAYS_OF_WEEK } from "@/constants/moods";
import {
  getDayId,
  simulateDelay,
  updateSelectedDayMood,
} from "../../lib/helpers";
import { db } from "../../database";

/**
 * Update mood for a specific day
 * PUT/PATCH /api/days/:day
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ day: string }> }
) {
  try {
    const { day } = await context.params;
    const dayLower = day.toLowerCase() as DayOfWeek;

    // Validate day of week
    if (!DAYS_OF_WEEK.includes(dayLower)) {
      return NextResponse.json(
        { error: "Invalid day of week" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { mood } = body;

    // Validate mood type
    const validMoods = [
      "happy",
      "tired",
      "focused",
      "stressed",
      "relaxed",
      "neutral",
    ];
    if (!mood || !validMoods.includes(mood)) {
      return NextResponse.json(
        { error: "Mood is required and must be valid" },
        { status: 400 }
      );
    }

    // Simulate server lag (300-1200ms)
    await simulateDelay();

    // Get day ID from database
    const dayId = await getDayId(dayLower);
    if (!dayId) {
      return NextResponse.json(
        { error: "Day not found in database" },
        { status: 404 }
      );
    }

    // Update the mood
    await updateSelectedDayMood(dayId, mood);

    // Fetch and return updated mood data
    const query = `
      SELECT 
        d.name as day,
        dm.mood_name as mood
      FROM days d
      LEFT JOIN day_moods dm ON d.id = dm.day_id
      WHERE d.id = ?
    `;

    const updatedMood = await new Promise((resolve, reject) => {
      db.get(
        query,
        [dayId],
        (err, row: { day: string; mood: string | null } | undefined) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            day: row?.day || dayLower,
            mood: row?.mood || null,
          });
        }
      );
    });

    return NextResponse.json({
      success: true,
      data: updatedMood,
    });
  } catch (error) {
    console.error("Error updating mood:", error);
    return NextResponse.json(
      { error: "Failed to update mood" },
      { status: 500 }
    );
  }
}

/**
 * PATCH is an alias for PUT for this endpoint
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ day: string }> }
) {
  return PUT(request, context);
}
