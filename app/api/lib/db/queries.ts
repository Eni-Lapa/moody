import { Day } from "@/types/mood.types";
import { db } from "./database";

// Helper function to get day ID
export function getDayId(dayName: string): Promise<number | null> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM days WHERE name = ?",
      [dayName.toLowerCase()],
      (err, row: { id: number } | undefined) => {
        if (err) reject(err);
        else resolve(row ? row.id : null);
      }
    );
  });
}

// Helper function to update mood
export function updateSelectedDayMood(
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

// Helper Function to get all days from database
export function getAllDays(): Promise<Day[]> {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        d.name as day,
        dm.mood_name as mood
      FROM days d
      LEFT JOIN day_moods dm ON d.id = dm.day_id
      ORDER BY d.order_index
    `;

    db.all(query, (err, rows: { day: string; mood: string | null }[]) => {
      if (err) {
        reject(err);
        return;
      }

      const days: Day[] = rows.map((row) => ({
        day: row.day as Day["day"],
        mood: row.mood as Day["mood"],
      }));

      resolve(days);
    });
  });
}
