import { setupDatabase, resetDatabase } from "../app/api/migrations";
import { db } from "../app/api/database";
import { MOODS } from "../constants/moods";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  console.log("🚀 Moody Database Initialization");
  console.log("================================\n");

  switch (command) {
    case "reset":
      console.log("⚠️  Resetting database (this will delete all data)...");
      resetDatabase();
      break;

    case "setup":
    default:
      console.log("📦 Setting up database...");
      setupDatabase();
      break;
  }

  // Give some time for async operations to complete
  setTimeout(() => {
    verifyDatabase();
  }, 2000);
}

function verifyDatabase() {
  console.log("\n🔍 Verifying database setup...\n");

  // Check days table
  db.get("SELECT COUNT(*) as count FROM days", (err, row: any) => {
    if (err) {
      console.error("❌ Error checking days table:", err.message);
      return;
    }
    console.log(`✅ Days table: ${row.count} records`);
  });

  // Check day_moods table
  db.get("SELECT COUNT(*) as count FROM day_moods", (err, row: any) => {
    if (err) {
      console.error("❌ Error checking day_moods table:", err.message);
      return;
    }
    console.log(`✅ Day moods table: ${row.count} records`);
  });

  // List available moods from frontend constant
  console.log("\n📊 Available moods (from frontend):");
  Object.entries(MOODS).forEach(([key, mood]) => {
    console.log(`   ${mood.emoji} ${mood.type}`);
  });

  // Show current mood assignments
  db.all(
    `SELECT d.name as day, dm.mood_name as mood 
     FROM days d 
     LEFT JOIN day_moods dm ON d.id = dm.day_id 
     ORDER BY d.order_index`,
    (err, rows: any[]) => {
      if (err) {
        console.error("❌ Error fetching day moods:", err.message);
        return;
      }
      console.log("\n📅 Current week setup:");
      rows.forEach((row) => {
        const moodDisplay = row.mood
          ? `${MOODS[row.mood as keyof typeof MOODS]?.emoji || "?"} ${row.mood}`
          : "not set";
        console.log(`   ${row.day}: ${moodDisplay}`);
      });
    }
  );

  // Close the database connection after verification
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err.message);
        return;
      }
      console.log("\n✨ Database setup complete!");
      process.exit(0);
    });
  }, 1000);
}

main().catch(console.error);
