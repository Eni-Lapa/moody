import { useCallback } from "react";
import { useMoodContext } from "@/contexts/MoodContext";
import { DayOfWeek, MoodType } from "@/types/mood.types";

export function useMoods() {
  const {
    days,
    isLoading,
    updateDayMood,
    refreshDays,
    getDisplayMood,
    isPending,
  } = useMoodContext();

  const updateSelectedDayMood = useCallback(
    async (day: DayOfWeek, mood: MoodType) => {
      await updateDayMood(day, mood);
    },
    [updateDayMood]
  );

  return {
    days,
    isLoading,
    updateSelectedDayMood,
    refreshDays,
    getDisplayMood,
    isPending,
  };
}
