import {
  Day,
  DayOfWeek,
  MoodType,
  UpdateMoodResponse,
} from "@/types/mood.types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }

  return response.json();
}

export const moodApi = {
  fetchDays: () => request<Day[]>("/api/days"),

  updateMood: (day: DayOfWeek, mood: MoodType) =>
    request<UpdateMoodResponse>(`/api/days/${day}`, {
      method: "PUT",
      body: JSON.stringify({ mood }),
    }),
};
