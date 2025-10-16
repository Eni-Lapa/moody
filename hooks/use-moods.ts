import { useMoodContext } from "@/contexts/MoodContext";
import { DayOfWeek, MoodType } from "@/types/mood.types";
import { useCallback } from "react";
import { toast } from "sonner";

export function useMoods() {
  const {
    isLoading,
    updateMood: contextUpdateMood,
    getMoodForDay,
  } = useMoodContext();

  const updateMood = useCallback(
    async (day: DayOfWeek, mood: MoodType | null) => {
      try {
        await contextUpdateMood(day, mood);

        // Show success toast
        toast("Mood updated");
      } catch (error) {
        // Show error toast
        toast("Failed to update mood");
      }
    },
    [contextUpdateMood, toast]
  );

  return {
    isLoading,
    getMoodForDay,
    updateMood,
  };
}
