import { UpdateMoodRequest, UpdateMoodResponse, Day } from "@/types/mood.types";

class DaysAPI {
  private baseUrl = "/api/days";

  /**
   * Fetch all days with mood information for the week
   */
  async fetchDays(): Promise<Day[]> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch days");
    }

    return response.json();
  }

  /**
   * Update mood for a specific day
   */
  async updateMood(
    day: string,
    request: UpdateMoodRequest
  ): Promise<UpdateMoodResponse> {
    const { mood } = request;

    const response = await fetch(`${this.baseUrl}/${day}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update mood");
    }

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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to clear mood");
    }

    return response.json();
  }
}

// Create singleton instance
export const daysAPI = new DaysAPI();
