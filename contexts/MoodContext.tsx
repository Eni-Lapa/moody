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

  // Log isLoading state whenever it changes
  useEffect(() => {
    console.log("[MoodContext] isLoading:", isLoading);
  }, [isLoading]);

  // Fetch days from the database on mount
  const refreshDays = useCallback(async () => {
    setIsLoading(true);
    console.log("[MoodContext] refreshDays: setIsLoading(true)");
    try {
      const data = await daysAPI.fetchDays();
      setDays(data);
      console.log("[MoodContext] refreshDays: setDays", data);
    } catch (error) {
      console.log("[MoodContext] refreshDays: error", error);
    } finally {
      setIsLoading(false);
      console.log("[MoodContext] refreshDays: setIsLoading(false)");
    }
  }, []);

  useEffect(() => {
    console.log("[MoodContext] useEffect: calling refreshDays");
    refreshDays();
  }, [refreshDays]);

  // Update day mood in the database
  const updateDayMood = useCallback(
    async (day: DayOfWeek, mood: MoodType) => {
      setIsLoading(true);
      console.log("[MoodContext] updateDayMood: setIsLoading(true)");
      try {
        // Updated to pass day and request separately
        await daysAPI.updateMood(day, { mood });
        await refreshDays(); // Refresh after update
        console.log("[MoodContext] updateDayMood: mood updated");
      } catch (error) {
        console.log("[MoodContext] updateDayMood: error", error);
      } finally {
        setIsLoading(false);
        console.log("[MoodContext] updateDayMood: setIsLoading(false)");
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
