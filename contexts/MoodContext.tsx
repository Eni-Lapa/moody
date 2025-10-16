"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { DayOfWeek, MoodType, DayMood } from "@/types/mood.types";
import { moodsAPI } from "@/app/services/mood.api";
interface MoodContextType {
  moods: DayMood[];
  isLoading: boolean;
  updateMood: (day: DayOfWeek, mood: MoodType | null) => Promise<void>;
  getMoodForDay: (day: DayOfWeek) => MoodType | null;
  refreshMoods: () => Promise<void>;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [moods, setMoods] = useState<DayMood[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch moods from the databaseon mount
  const refreshMoods = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await moodsAPI.fetchMoods();
      setMoods(data.days);
      console.log("jan marr nga db:", data);
    } catch (error) {
      console.log("sjan marr vlerat nga db", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMoods();
  }, [refreshMoods]);

  // Update mood in the database
  const updateMood = useCallback(
    async (day: DayOfWeek, mood: MoodType | null) => {
      setIsLoading(true);
      try {
        await moodsAPI.updateMood({ day, mood });
        await refreshMoods(); // Refresh after update
      } catch (error) {
        // Handle error (optional)
      } finally {
        setIsLoading(false);
      }
    },
    [refreshMoods]
  );

  // Get mood for a specific day
  const getMoodForDay = useCallback(
    (day: DayOfWeek): MoodType | null => {
      const found = moods.find((m) => m.day === day);
      return found?.mood ?? null;
    },
    [moods]
  );

  const value: MoodContextType = {
    moods,
    isLoading,
    updateMood,
    getMoodForDay,
    refreshMoods,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

export function useMoodContext() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMoodContext must be used within MoodProvider");
  }
  return context;
}
