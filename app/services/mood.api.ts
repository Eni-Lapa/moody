// app/services/moods.api.ts
import {
  MoodBoardState,
  UpdateMoodRequest,
  UpdateMoodResponse,
  DayMood,
  MoodStats,
} from "@/types/mood.types";

class MoodsAPI {
  private baseUrl = "/api/moods";

  /**
   * Fetch all moods for the week
   */
  async fetchMoods(): Promise<MoodBoardState> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch moods");
    return response.json();
  }

  /**
   * Fetch mood for a specific day
   */
  async fetchMoodForDay(day: string): Promise<{ data: DayMood }> {
    const response = await fetch(`${this.baseUrl}/${day}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`Failed to fetch mood for ${day}`);
    return response.json();
  }

  /**
   * Update mood for a specific day
   */
  async updateMood(request: UpdateMoodRequest): Promise<UpdateMoodResponse> {
    const { day, mood } = request;
    const response = await fetch(`${this.baseUrl}/${day}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    });
    if (!response.ok) throw new Error("Failed to update mood");
    return response.json();
  }

  /**
   * Clear mood for a specific day
   */
  async clearMood(day: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/${day}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`Failed to clear mood for ${day}`);
    return response.json();
  }

  /**
   * Get mood statistics
   */
  async getMoodStats(): Promise<MoodStats> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch mood statistics");
    return response.json();
  }
}

// Create singleton instance
export const moodsAPI = new MoodsAPI();
