"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { DayOfWeek, MoodType, Day } from "@/types/mood.types";
import { daysAPI } from "@/app/services/mood.api";

interface MoodContextType {
  days: Day[];
  isLoading: boolean;
  updateDayMood: (day: DayOfWeek, mood: MoodType) => Promise<void>;
  refreshDays: () => Promise<void>;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState<Day[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch days from the database on mount
  const refreshDays = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await daysAPI.fetchDays();
      setDays(data);
    } catch (error) {
      console.log("[MoodContext] refreshDays: error", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDays();
  }, [refreshDays]);

  // Update mood for the selected day in the database
  const updateDayMood = useCallback(
    async (day: DayOfWeek, mood: MoodType) => {
      setIsLoading(true);
      try {
        await daysAPI.updateSelectedDayMood(day, { mood });
        await refreshDays();
      } catch (error) {
        console.log("[MoodContext] updateDayMood: error", error);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshDays]
  );

  const value: MoodContextType = {
    days,
    isLoading,
    updateDayMood,
    refreshDays,
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
