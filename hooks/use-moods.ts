import { useMoodContext } from "@/contexts/MoodContext";
import { DayOfWeek, MoodType } from "@/types/mood.types";
import { useCallback } from "react";
import { toast } from "sonner";

export function useMoods() {
  const { isLoading, updateDayMood: contextUpdateMood } = useMoodContext();

  const updateSelectedDayMood = useCallback(
    async (day: DayOfWeek, mood: MoodType) => {
      try {
        await contextUpdateMood(day, mood);
        toast.success("Mood updated successfully! 🎉");
      } catch (error) {
        console.error("Failed to update mood:", error);
        toast.error("Failed to update mood. Please try again.");
      }
    },
    [contextUpdateMood]
  );

  return {
    isLoading,
    updateSelectedDayMood,
  };
}
