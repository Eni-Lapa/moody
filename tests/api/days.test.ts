// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/days/route";
import { PATCH, PUT } from "@/app/api/days/[day]/route";
import { db } from "@/app/api/lib/db/database";
import { DAYS_OF_WEEK } from "@/constants/moods";
import type { Day } from "@/types/mood.types";

// Runs against a real in-memory SQLite database (DATABASE_PATH in the
// Vitest config); only the artificial latency is switched off.
vi.mock("@/app/api/lib/helpers", () => ({
  simulateDelay: vi.fn(async () => {}),
}));

function update(day: string, body: string, method: "PUT" | "PATCH" = "PUT") {
  const request = new NextRequest(`http://localhost/api/days/${day}`, {
    method,
    body,
  });
  const handler = method === "PUT" ? PUT : PATCH;
  return handler(request, { params: Promise.resolve({ day }) });
}

async function getWeek(): Promise<Day[]> {
  return (await GET()).json();
}

beforeEach(async () => {
  await new Promise<void>((resolve, reject) =>
    db.run("UPDATE day_moods SET mood_name = NULL", (err) =>
      err ? reject(err) : resolve()
    )
  );
});

describe("GET /api/days", () => {
  it("returns the whole week in order", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    const days: Day[] = await response.json();
    expect(days.map((d) => d.day)).toEqual(DAYS_OF_WEEK);
    expect(days.every((d) => d.mood === null)).toBe(true);
  });
});

describe("PUT /api/days/:day", () => {
  it("saves the mood and returns the updated day", async () => {
    const response = await update("monday", JSON.stringify({ mood: "happy" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { day: "monday", mood: "happy" },
    });
    expect((await getWeek())[0]).toEqual({ day: "monday", mood: "happy" });
  });

  it("replaces an earlier mood", async () => {
    await update("friday", JSON.stringify({ mood: "tired" }));
    await update("friday", JSON.stringify({ mood: "relaxed" }));

    expect((await getWeek())[4]).toEqual({ day: "friday", mood: "relaxed" });
  });

  it("accepts the day in any letter case", async () => {
    const response = await update("Sunday", JSON.stringify({ mood: "neutral" }));

    expect(response.status).toBe(200);
    expect((await getWeek())[6]).toEqual({ day: "sunday", mood: "neutral" });
  });

  it("treats PATCH the same as PUT", async () => {
    const response = await update(
      "wednesday",
      JSON.stringify({ mood: "focused" }),
      "PATCH"
    );

    expect(response.status).toBe(200);
    expect((await getWeek())[2]).toEqual({ day: "wednesday", mood: "focused" });
  });

  it.each([
    ["an unknown day", "funday", '{"mood":"happy"}', "Invalid day of week"],
    ["an unknown mood", "monday", '{"mood":"angry"}', "Mood must be one of"],
    ["a missing mood", "monday", "{}", "Mood must be one of"],
    ["malformed JSON", "monday", "{oops", "Mood must be one of"],
  ])("rejects %s with 400 and stores nothing", async (_, day, body, error) => {
    const response = await update(day, body);

    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain(error);
    expect((await getWeek()).every((d) => d.mood === null)).toBe(true);
  });
});
