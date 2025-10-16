import { NextRequest, NextResponse } from "next/server";
import { db } from "../database";
import { DayMood } from "@/types/mood.types";

// Simulate server delay
async function simulateDelay() {
  const delay = Math.floor(Math.random() * (1200 - 300 + 1)) + 300;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// Helper function to get all moods from database
function getAllMoods(): Promise<DayMood[]> {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        d.name as day,
        d.name,
        d.order_index,
        m.name as mood,
        m.emoji,
        m.color,
        dm.updated_at
      FROM days d
      LEFT JOIN day_moods dm ON d.id = dm.day_id
      LEFT JOIN moods m ON dm.mood_id = m.id
      ORDER BY d.order_index
    `;

    db.all(query, (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }

      const days: DayMood[] = rows.map((row) => ({
        day: row.day,
        mood: row.mood || null,
        emoji: row.emoji || null,
        color: row.color || null,
        updatedAt: row.updated_at,
      }));

      resolve(days);
    });
  });
}

export async function GET(request: NextRequest) {
  try {
    // Simulate server delay
    await simulateDelay();

    // Get all moods from database
    const days = await getAllMoods();

    return NextResponse.json({ days });
  } catch (error) {
    console.error("Error fetching moods:", error);
    return NextResponse.json(
      { error: "Failed to fetch moods" },
      { status: 500 }
    );
  }
}
