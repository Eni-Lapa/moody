import {
  MoodBoardState,
  UpdateMoodRequest,
  UpdateMoodResponse,
} from "@/types/mood.types";

class MoodsAPI {
  private baseUrl = "/api/moods";

  async fetchMoods(): Promise<MoodBoardState> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch moods");
    }
    return response.json();
  }

  async updateMood(request: UpdateMoodRequest): Promise<UpdateMoodResponse> {
    const { day, mood } = request;
    const response = await fetch(`${this.baseUrl}/${day}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mood }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update mood");
    }
    return response.json();
  }
}

export const moodsAPI = new MoodsAPI();
