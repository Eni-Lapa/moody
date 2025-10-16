import { NextRequest, NextResponse } from "next/server";
import { db } from "../../database";
import { DayOfWeek, MoodType } from "@/types/mood.types";
import { DAYS_OF_WEEK, MOODS } from "@/constants/moods";

// Simulate server delay
async function simulateDelay() {
  const delay = Math.floor(Math.random() * (1200 - 300 + 1)) + 300;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// Helper function to get day ID
function getDayId(dayName: string): Promise<number | null> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM days WHERE name = ?",
      [dayName.toLowerCase()],
      (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row ? row.id : null);
      }
    );
  });
}

// Helper function to get mood ID
function getMoodId(moodName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM moods WHERE name = ?",
      [moodName.toLowerCase()],
      (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row ? row.id : null);
      }
    );
  });
}

// Helper function to get current mood for a day
function getCurrentMood(dayId: number): Promise<number | null> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT mood_id FROM day_moods WHERE day_id = ?",
      [dayId],
      (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row ? row.mood_id : null);
      }
    );
  });
}

// Helper function to update mood
function updateMood(
  dayId: number,
  moodId: number | null,
  requestId: string,
  timestamp: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO day_moods (day_id, mood_id, request_id, timestamp)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(day_id) DO UPDATE SET
        mood_id = excluded.mood_id,
        request_id = excluded.request_id,
        timestamp = excluded.timestamp,
        updated_at = CURRENT_TIMESTAMP
      `,
      [dayId, moodId, requestId, timestamp],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}

// Helper function to log mood change
function logMoodChange(
  dayId: number,
  previousMoodId: number | null,
  newMoodId: number | null,
  requestId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO mood_change_log (day_id, previous_mood_id, new_mood_id, request_id)
      VALUES (?, ?, ?, ?)
      `,
      [dayId, previousMoodId, newMoodId, requestId],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { day: string } }
) {
  try {
    console.log("GET handler called with params:", params);

    // Validate day parameter
    const day = params.day.toLowerCase() as DayOfWeek;
    console.log("Normalized day:", day);

    if (!DAYS_OF_WEEK.includes(day)) {
      console.log("Invalid day of week:", day);
      return NextResponse.json(
        { error: "Invalid day of week" },
        { status: 400 }
      );
    }

    // Simulate server delay
    console.log("Simulating server delay...");
    await simulateDelay();
    console.log("Delay finished.");

    // Get the mood for this specific day
    const query = `
      SELECT 
        d.name as day,
        m.name as mood,
        m.emoji,
        m.color,
        dm.updated_at
      FROM days d
      LEFT JOIN day_moods dm ON d.id = dm.day_id
      LEFT JOIN moods m ON dm.mood_id = m.id
      WHERE d.name = ?
    `;
    console.log("Executing query to fetch mood for day:", day);

    const dayMood = await new Promise((resolve, reject) => {
      db.get(query, [day], (err, row: any) => {
        if (err) {
          console.log("Error executing query:", err);
          reject(err);
          return;
        }
        console.log("Query result row:", row);
        resolve({
          day: row?.day || day,
          mood: row?.mood,
          emoji: row?.emoji || null,
          color: row?.color || null,
          updatedAt: row?.updated_at || null,
        });
      });
    });

    console.log("Returning response:", { data: dayMood });
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
    console.log("PUT handler called with context:", context);

    // Await params before using
    const { day } = await context.params;
    console.log("Day param received:", day);

    const dayLower = day.toLowerCase() as DayOfWeek;
    console.log("Normalized day:", dayLower);

    if (!DAYS_OF_WEEK.includes(dayLower)) {
      console.log("Invalid day of week:", dayLower);
      return NextResponse.json(
        { error: "Invalid day of week" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);

    const { mood, requestId, timestamp } = body;
    console.log("Mood from body:", mood);

    if (!mood || !Object.keys(MOODS).includes(mood)) {
      console.log("Mood is missing or invalid:", mood);
      return NextResponse.json(
        { error: "Mood is required and must be valid" },
        { status: 400 }
      );
    }

    // Get day ID
    const dayId = await getDayId(dayLower);
    console.log("Fetched dayId:", dayId);

    if (!dayId) {
      console.log("Day not found in database:", dayLower);
      return NextResponse.json(
        { error: "Day not found in database" },
        { status: 404 }
      );
    }

    // Get mood ID if mood is provided
    let moodId: number;
    if (mood) {
      moodId = await getMoodId(mood);
      console.log("Fetched moodId:", moodId);

      if (!moodId) {
        console.log("Mood not found in database:", mood);
        return NextResponse.json(
          { error: "Mood not found in database" },
          { status: 404 }
        );
      }
    }

    // Get current mood for logging
    const currentMoodId = await getCurrentMood(dayId);
    console.log("Current moodId for day:", currentMoodId);

    // Start a transaction
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION", async (err) => {
          if (err) {
            console.log("Error starting transaction:", err);
            reject(err);
            return;
          }

          try {
            // Update the mood
            console.log("Updating mood in DB...");
            await updateMood(
              dayId,
              moodId,
              requestId || `${dayLower}-${Date.now()}`,
              timestamp || Date.now()
            );
            console.log("Mood updated in DB.");

            // Log the change if mood actually changed
            if (currentMoodId !== moodId) {
              console.log("Logging mood change...");
              await logMoodChange(
                dayId,
                currentMoodId,
                moodId,
                requestId || `${dayLower}-${Date.now()}`
              );
              console.log("Mood change logged.");
            }

            db.run("COMMIT", (err) => {
              if (err) {
                console.log("Error committing transaction:", err);
                reject(err);
                return;
              }
              console.log("Transaction committed.");
              resolve(null);
            });
          } catch (error) {
            db.run("ROLLBACK");
            console.log("Error during transaction, rolled back:", error);
            reject(error);
          }
        });
      });
    });

    // Get the updated mood data
    const query = `
      SELECT 
        d.name as day,
        m.name as mood,
        m.emoji,
        m.color,
        dm.updated_at
      FROM days d
      LEFT JOIN day_moods dm ON d.id = dm.day_id
      LEFT JOIN moods m ON dm.mood_id = m.id
      WHERE d.id = ?
    `;
    console.log("Fetching updated mood data...");
    const updatedMood = await new Promise((resolve, reject) => {
      db.get(query, [dayId], (err, row: any) => {
        if (err) {
          console.log("Error fetching updated mood data:", err);
          reject(err);
          return;
        }
        console.log("Updated mood row:", row);
        resolve({
          day: row?.day || day,
          mood: row?.mood || null,
          emoji: row?.emoji || null,
          color: row?.color || null,
          updatedAt: row?.updated_at,
        });
      });
    });

    console.log("Returning response:", {
      success: true,
      data: updatedMood,
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
  // PATCH behaves the same as PUT for this use case
  return PUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { day: string } }
) {
  try {
    // Validate day parameter
    const day = params.day.toLowerCase() as DayOfWeek;
    if (!DAYS_OF_WEEK.includes(day)) {
      return NextResponse.json(
        { error: "Invalid day of week" },
        { status: 400 }
      );
    }

    // Get day ID
    const dayId = await getDayId(day);
    if (!dayId) {
      return NextResponse.json(
        { error: "Day not found in database" },
        { status: 404 }
      );
    }

    // Clear the mood (set to null)
    await updateMood(dayId, null, `delete-${day}-${Date.now()}`, Date.now());

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
