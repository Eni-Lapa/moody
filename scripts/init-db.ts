import { setupDatabase, resetDatabase } from "../app/api/migrations";
import { db } from "../app/api/database";

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
    // Verify the setup
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

  // Check moods table
  db.get("SELECT COUNT(*) as count FROM moods", (err, row: any) => {
    if (err) {
      console.error("❌ Error checking moods table:", err.message);
      return;
    }
    console.log(`✅ Moods table: ${row.count} records`);
  });

  // Check day_moods table
  db.get("SELECT COUNT(*) as count FROM day_moods", (err, row: any) => {
    if (err) {
      console.error("❌ Error checking day_moods table:", err.message);
      return;
    }
    console.log(`✅ Day moods table: ${row.count} records`);
  });

  // List available moods
  db.all("SELECT name, emoji FROM moods", (err, rows: any[]) => {
    if (err) {
      console.error("❌ Error fetching moods:", err.message);
      return;
    }
    console.log("\n📊 Available moods:");
    rows.forEach((mood) => {
      console.log(`   ${mood.emoji} ${mood.name}`);
    });
  });

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
