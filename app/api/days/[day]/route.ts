import { NextRequest, NextResponse } from "next/server";
import { db } from "../../database";
import { DayOfWeek, MoodType } from "@/types/mood.types";
import { DAYS_OF_WEEK } from "@/constants/moods";

// Simulate server delay
async function simulateDelay() {
  const delay = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// Helper function to get day ID
function getDayId(dayName: string): Promise<number | null> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM days WHERE name = ?",
      [dayName.toLowerCase()],
      (err, row: any) => {
        if (err) reject(err);
        else resolve(row ? row.id : null);
      }
    );
  });
}

// Helper function to update mood
function updateSelectedDayMood(
  dayId: number,
  moodName: string | null
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO day_moods (day_id, mood_name)
       VALUES (?, ?)
       ON CONFLICT(day_id) DO UPDATE SET mood_name = excluded.mood_name`,
      [dayId, moodName],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { day: string } }
) {
  try {
    const day = params.day.toLowerCase() as DayOfWeek;

    if (!DAYS_OF_WEEK.includes(day)) {
      return NextResponse.json(
        { error: "Invalid day of week" },
        { status: 400 }
      );
    }

    await simulateDelay();

    const query = `
      SELECT 
        d.name as day,
        dm.mood_name as mood
      FROM days d
      LEFT JOIN day_moods dm ON d.id = dm.day_id
      WHERE d.name = ?
    `;

    const dayMood = await new Promise((resolve, reject) => {
      db.get(query, [day], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          day: row?.day || day,
          mood: row?.mood || null,
        });
      });
    });

    return NextResponse.json({ data: dayMood });
  } catch (error) {
    console.error("Error fetching mood:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { day: string } }
) {
  try {
    const { day } = await context.params;
    const dayLower = day.toLowerCase() as DayOfWeek;

    if (!DAYS_OF_WEEK.includes(dayLower)) {
      return NextResponse.json(
        { error: "Invalid day of week" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { mood } = body;

    // Validate mood is one of the allowed types
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

    // Get day ID
    const dayId = await getDayId(dayLower);
    if (!dayId) {
      return NextResponse.json(
        { error: "Day not found in database" },
        { status: 404 }
      );
    }

    // Update the mood (just store the mood name)
    await updateSelectedDayMood(dayId, mood);

    // Get the updated mood data
    const query = `
      SELECT 
        d.name as day,
        dm.mood_name as mood
      FROM days d
      LEFT JOIN day_moods dm ON d.id = dm.day_id
      WHERE d.id = ?
    `;

    const updatedMood = await new Promise((resolve, reject) => {
      db.get(query, [dayId], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          day: row?.day || day,
          mood: row?.mood || null,
        });
      });
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { day: string } }
) {
  return PUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { day: string } }
) {
  try {
    const day = params.day.toLowerCase() as DayOfWeek;

    if (!DAYS_OF_WEEK.includes(day)) {
      return NextResponse.json(
        { error: "Invalid day of week" },
        { status: 400 }
      );
    }

    const dayId = await getDayId(day);
    if (!dayId) {
      return NextResponse.json(
        { error: "Day not found in database" },
        { status: 404 }
      );
    }

    // Clear the mood (set to null)
    await updateSelectedDayMood(dayId, null);

    return NextResponse.json({
      success: true,
      message: `Mood cleared for ${day}`,
    });
  } catch (error) {
    console.error("Error deleting mood:", error);
    return NextResponse.json(
      { error: "Failed to delete mood" },
      { status: 500 }
    );
  }
}
