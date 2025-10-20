import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "mood.db");

async function runCommand(command: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  // Check if database exists
  if (!fs.existsSync(DB_PATH)) {
    console.log("📦 Database not found. Initializing...");
    await runCommand("npm", ["run", "db:init"]);
    console.log("✅ Database initialized!");
  } else {
    console.log("✅ Database found!");
  }

  console.log("🏗️  Building application...");
  await runCommand("npm", ["run", "build"]);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
