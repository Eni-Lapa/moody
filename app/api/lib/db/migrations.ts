import { db } from "./database";

export const migrate = () => {
  db.serialize(() => {
    // Create days table
    db.run(
      `CREATE TABLE IF NOT EXISTS days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        order_index INTEGER NOT NULL
      );`,
      (err: Error | null) => {
        if (err) {
          console.error("Error creating days table:", err.message);
        } else {
          console.log("days table created successfully.");
        }
      }
    );

    // Create day_moods table - only stores the mood name reference
    db.run(
      `CREATE TABLE IF NOT EXISTS day_moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_id INTEGER NOT NULL,
        mood_name TEXT,
        FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
        UNIQUE(day_id)
      );`,
      (err: Error | null) => {
        if (err) {
          console.error("Error creating day_moods table:", err.message);
        } else {
          console.log("day_moods table created successfully.");
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
      { name: "monday", order: 1 },
      { name: "tuesday", order: 2 },
      { name: "wednesday", order: 3 },
      { name: "thursday", order: 4 },
      { name: "friday", order: 5 },
      { name: "saturday", order: 6 },
      { name: "sunday", order: 7 },
    ];

    const insertDay = db.prepare(
      `INSERT OR IGNORE INTO days (name, order_index) VALUES (?, ?)`
    );

    days.forEach((day) => {
      insertDay.run(day.name, day.order);
    });

    insertDay.finalize();

    // Initialize day_moods with null moods for each day
    db.run(
      `INSERT OR IGNORE INTO day_moods (day_id, mood_name)
       SELECT id, NULL FROM days;`,
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
    (err: Error | null, row: { count: number } | undefined) => {
      if (err) {
        console.error("Error checking days table:", err.message);
        return;
      }

      if (row && row.count === 0) {
        console.log("Seeding initial data...");
        seed();
      } else {
        console.log("Database already contains data, skipping seed.");
      }
    }
  );
};

// Reset database (development only)
export const resetDatabase = () => {
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS day_moods");
    db.run("DROP TABLE IF EXISTS days");

    console.log("Database tables dropped.");

    // Recreate and seed
    setupDatabase();
  });
};
