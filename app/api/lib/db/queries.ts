import { Day, DayOfWeek, MoodType } from "@/types/mood.types";
import { db } from "./database";

const SELECT_DAYS = `
  SELECT d.name AS day, dm.mood_name AS mood
  FROM days d
  LEFT JOIN day_moods dm ON d.id = dm.day_id`;

export function getAllDays(): Promise<Day[]> {
  return new Promise((resolve, reject) => {
    db.all(`${SELECT_DAYS} ORDER BY d.order_index`, (err, rows: Day[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function getDay(day: DayOfWeek): Promise<Day | undefined> {
  return new Promise((resolve, reject) => {
    db.get(`${SELECT_DAYS} WHERE d.name = ?`, [day], (err, row?: Day) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function setDayMood(day: DayOfWeek, mood: MoodType): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO day_moods (day_id, mood_name)
       SELECT id, ? FROM days WHERE name = ?
       ON CONFLICT(day_id) DO UPDATE SET mood_name = excluded.mood_name`,
      [mood, day],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}
