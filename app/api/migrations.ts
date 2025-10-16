import { db } from "./database";

export const migrate = () => {
  db.serialize(() => {
    // Create moods table to store available mood types
    db.run(
      `
      CREATE TABLE IF NOT EXISTS moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        emoji TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      `,
      (err: Error | null) => {
        if (err) {
          console.error("Error creating moods table:", err.message);
        } else {
          console.log("moods table created successfully.");
        }
      }
    );

    // Create days table to store days of the week
    db.run(
      `
      CREATE TABLE IF NOT EXISTS days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      `,
      (err: Error | null) => {
        if (err) {
          console.error("Error creating days table:", err.message);
        } else {
          console.log("days table created successfully.");
        }
      }
    );

    // Create day_moods table to store the mood for each day
    db.run(
      `
      CREATE TABLE IF NOT EXISTS day_moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_id INTEGER NOT NULL,
        mood_id INTEGER,
        request_id TEXT,
        timestamp BIGINT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
        FOREIGN KEY (mood_id) REFERENCES moods(id) ON DELETE SET NULL,
        UNIQUE(day_id)
      );
      `,
      (err: Error | null) => {
        if (err) {
          console.error("Error creating day_moods table:", err.message);
        } else {
          console.log("day_moods table created successfully.");
        }
      }
    );

    // Create index for faster lookups
    db.run(
      `
      CREATE INDEX IF NOT EXISTS idx_day_moods_day_id 
      ON day_moods(day_id);
      `,
      (err: Error | null) => {
        if (err) {
          console.error("Error creating index:", err.message);
        } else {
          console.log("Index created successfully.");
        }
      }
    );

    // Create audit log table for mood changes
    db.run(
      `
      CREATE TABLE IF NOT EXISTS mood_change_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_id INTEGER NOT NULL,
        previous_mood_id INTEGER,
        new_mood_id INTEGER,
        request_id TEXT,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
        FOREIGN KEY (previous_mood_id) REFERENCES moods(id) ON DELETE SET NULL,
        FOREIGN KEY (new_mood_id) REFERENCES moods(id) ON DELETE SET NULL
      );
      `,
      (err: Error | null) => {
        if (err) {
          console.error("Error creating mood_change_log table:", err.message);
        } else {
          console.log("mood_change_log table created successfully.");
        }
      }
    );
  });
};

// Seed initial data
export const seed = () => {
  db.serialize(() => {
    // Seed days of the week
    const days = [
      { name: "monday", display_name: "Monday", order_index: 1 },
      { name: "tuesday", display_name: "Tuesday", order_index: 2 },
      { name: "wednesday", display_name: "Wednesday", order_index: 3 },
      { name: "thursday", display_name: "Thursday", order_index: 4 },
      { name: "friday", display_name: "Friday", order_index: 5 },
      { name: "saturday", display_name: "Saturday", order_index: 6 },
      { name: "sunday", display_name: "Sunday", order_index: 7 },
    ];

    const insertDay = db.prepare(
      `INSERT OR IGNORE INTO days (name, display_name, order_index) VALUES (?, ?, ?)`
    );

    days.forEach((day) => {
      insertDay.run(day.name, day.display_name, day.order_index);
    });

    insertDay.finalize();

    // Seed mood types (you can customize these based on your MOODS constant)
    const moods = [
      { name: "happy", emoji: "😊", color: "#FFD700" },
      { name: "sad", emoji: "😢", color: "#4169E1" },
      { name: "excited", emoji: "🎉", color: "#FF69B4" },
      { name: "anxious", emoji: "😰", color: "#FF6347" },
      { name: "calm", emoji: "😌", color: "#98D8C8" },
      { name: "angry", emoji: "😠", color: "#DC143C" },
      { name: "tired", emoji: "😴", color: "#708090" },
      { name: "energetic", emoji: "⚡", color: "#FFA500" },
      { name: "grateful", emoji: "🙏", color: "#DDA0DD" },
      { name: "confused", emoji: "😕", color: "#D3D3D3" },
    ];

    const insertMood = db.prepare(
      `INSERT OR IGNORE INTO moods (name, emoji, color) VALUES (?, ?, ?)`
    );

    moods.forEach((mood) => {
      insertMood.run(mood.name, mood.emoji, mood.color);
    });

    insertMood.finalize();

    // Initialize day_moods with null moods for each day
    db.run(
      `
      INSERT OR IGNORE INTO day_moods (day_id, mood_id)
      SELECT id, NULL FROM days;
      `,
      (err: Error | null) => {
        if (err) {
          console.error("Error initializing day_moods:", err.message);
        } else {
          console.log("day_moods initialized successfully.");
        }
      }
    );

    console.log("Database seeded successfully.");
  });
};

// Run migrations and seed data
export const setupDatabase = () => {
  migrate();

  // Check if we need to seed data
  db.get(
    "SELECT COUNT(*) as count FROM days",
    (err: Error | null, row: any) => {
      if (err) {
        console.error("Error checking days table:", err.message);
        return;
      }

      if (row.count === 0) {
        console.log("Seeding initial data...");
        seed();
      } else {
        console.log("Database already contains data, skipping seed.");
      }
    }
  );
};

// Helper function to reset the database (useful for development)
export const resetDatabase = () => {
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS mood_change_log");
    db.run("DROP TABLE IF EXISTS day_moods");
    db.run("DROP TABLE IF EXISTS days");
    db.run("DROP TABLE IF EXISTS moods");

    console.log("Database tables dropped.");

    // Recreate and seed
    setupDatabase();
  });
};
