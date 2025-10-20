import { NextRequest, NextResponse } from "next/server";
import { db } from "../database";
import { Day } from "@/types/mood.types";

// Simulate server delay
async function simulateDelay() {
  const delay = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// Helper Function to get all days from database
function getAllDays(): Promise<Day[]> {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        d.name as day,
        dm.mood_name as mood
      FROM days d
      LEFT JOIN day_moods dm ON d.id = dm.day_id
      ORDER BY d.order_index
    `;

    db.all(query, (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }

      const days: Day[] = rows.map((row) => ({
        day: row.day,
        mood: row.mood || null,
      }));

      resolve(days);
    });
  });
}

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
