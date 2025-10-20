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
import { toast } from "sonner";
import { formatDayOfWeek } from "@/lib/utils";

interface OptimisticUpdate {
  mood: MoodType;
  timestamp: number;
}

interface MoodContextType {
  days: Day[];
  isLoading: boolean;
  updateDayMood: (day: DayOfWeek, mood: MoodType) => Promise<void>;
  refreshDays: () => Promise<void>;
  getDisplayMood: (day: DayOfWeek) => MoodType | null;
  isPending: (day: DayOfWeek) => boolean;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState<Day[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Optimistic updates: stores temporary mood changes before server confirms
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Partial<Record<DayOfWeek, OptimisticUpdate>>
  >({});

  // Pending requests: tracks which requests are in-flight to handle out-of-order responses
  const [pendingRequests, setPendingRequests] = useState<
    Partial<Record<DayOfWeek, number>>
  >({});

  // Fetch days from the database on mount
  const refreshDays = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await daysAPI.fetchDays();
      setDays(data);
    } catch (error) {
      console.error("[MoodContext] refreshDays: error", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to load your moods", {
        description: errorMessage,
        action: {
          label: "Retry",
          onClick: () => refreshDays(),
        },
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDays();
  }, [refreshDays]);

  // Get the mood to display: optimistic update takes precedence over server data
  const getDisplayMood = useCallback(
    (day: DayOfWeek): MoodType | null => {
      // If there's an optimistic update, show that
      if (optimisticUpdates[day]) {
        return optimisticUpdates[day].mood;
      }

      // Otherwise show server data
      const serverDay = days.find((d) => d.day === day);
      return serverDay?.mood ?? null;
    },
    [days, optimisticUpdates]
  );

  // Check if a day has a pending update
  const isPending = useCallback(
    (day: DayOfWeek): boolean => {
      return !!pendingRequests[day];
    },
    [pendingRequests]
  );

  // Update mood with optimistic UI
  const updateDayMood = useCallback(async (day: DayOfWeek, mood: MoodType) => {
    // Generate unique timestamp for this request to handle out-of-order responses
    const requestTimestamp = Date.now();

    // IMMEDIATE optimistic update (user sees change instantly)
    setOptimisticUpdates((prev) => ({
      ...prev,
      [day]: { mood, timestamp: requestTimestamp },
    }));

    // Track this as a pending request
    setPendingRequests((prev) => ({
      ...prev,
      [day]: requestTimestamp,
    }));

    // Show loading toast for slow requests (after 1 second)
    const loadingToastTimeout = setTimeout(() => {
      toast.loading(`Saving ${formatDayOfWeek(day)} mood...`, {
        id: `loading-${day}`,
      });
    }, 1000);

    try {
      // Fire server update in the background
      const response = await daysAPI.updateSelectedDayMood(day, { mood });

      // Clear loading toast if it was shown
      clearTimeout(loadingToastTimeout);
      toast.dismiss(`loading-${day}`);

      // Reconcile when server responds (only if this is still the latest request)
      setPendingRequests((prev) => {
        // If this request timestamp matches the current pending request, it's the latest
        if (prev[day] === requestTimestamp) {
          // Remove from pending
          const newPending = { ...prev };
          delete newPending[day];
          return newPending;
        }
        // Otherwise, a newer request is in flight, ignore this response
        return prev;
      });

      // Update with authoritative server data (server wins)
      setDays((currentDays) => {
        return currentDays.map((d) =>
          d.day === day ? { ...d, mood: response.data.mood } : d
        );
      });

      // Clear optimistic update for this day
      setOptimisticUpdates((prev) => {
        const newOptimistic = { ...prev };
        delete newOptimistic[day];
        return newOptimistic;
      });

      // Success feedback
      toast.success(`${formatDayOfWeek(day)} mood updated!`, {
        duration: 2000,
      });
    } catch (error) {
      console.error("[MoodContext] updateDayMood: error", error);

      // Clear loading toast if it was shown
      clearTimeout(loadingToastTimeout);
      toast.dismiss(`loading-${day}`);

      // Remove from pending on error
      setPendingRequests((prev) => {
        const newPending = { ...prev };
        delete newPending[day];
        return newPending;
      });

      // Clear optimistic update (revert to server state)
      setOptimisticUpdates((prev) => {
        const newOptimistic = { ...prev };
        delete newOptimistic[day];
        return newOptimistic;
      });

      // Show error toast (non-blocking) with more helpful message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to update ${formatDayOfWeek(day)} mood`, {
        description: errorMessage,
        duration: 4000,
      });
    }
  }, []);

  const value: MoodContextType = {
    days,
    isLoading,
    updateDayMood,
    refreshDays,
    getDisplayMood,
    isPending,
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
