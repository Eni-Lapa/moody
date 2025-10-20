import { Day } from "@/types/mood.types";
import { db } from "./db/database";

// Simulate server delay
export async function simulateDelay(min = 300, max = 1200) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, delay));
}
