import { UpdateMoodRequest, UpdateMoodResponse, Day } from "@/types/mood.types";

class DaysAPI {
  private baseUrl = "/api/days";

  /**
   * Fetch all days with mood information for the week
   */
  async fetchDays(): Promise<Day[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch days (${response.status})`
        );
      }

      return response.json();
    } catch (error) {
      // Re-throw with more context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error while fetching days");
    }
  }

  /**
   * Update mood for a specific day
   */
  async updateSelectedDayMood(
    day: string,
    request: UpdateMoodRequest
  ): Promise<UpdateMoodResponse> {
    const { mood } = request;

    try {
      const response = await fetch(`${this.baseUrl}/${day}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to update mood (${response.status})`
        );
      }

      return response.json();
    } catch (error) {
      // Re-throw with more context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error while updating mood");
    }
  }

  /**
   * Clear mood for a specific day
   */
  async clearMood(day: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${day}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to clear mood (${response.status})`
        );
      }

      return response.json();
    } catch (error) {
      // Re-throw with more context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error while clearing mood");
    }
  }
}

// Create singleton instance
export const daysAPI = new DaysAPI();
