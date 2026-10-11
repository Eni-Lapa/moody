"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import { DayOfWeek, MoodType, Day } from "@/types/mood.types";
import { moodApi } from "@/app/services/mood.api";
import { toast } from "sonner";
import { formatDayOfWeek } from "@/lib/utils";

type MoodByDay = Partial<Record<DayOfWeek, MoodType>>;

interface MoodContextType {
  days: Day[];
  isLoading: boolean;
  updateDayMood: (day: DayOfWeek, mood: MoodType) => void;
  refreshDays: () => Promise<void>;
  getDisplayMood: (day: DayOfWeek) => MoodType | null;
  isPending: (day: DayOfWeek) => boolean;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

function without(moods: MoodByDay, day: DayOfWeek): MoodByDay {
  const rest = { ...moods };
  delete rest[day];
  return rest;
}

export function MoodProvider({ children }: { children: ReactNode }) {
  // What the server has confirmed
  const [days, setDays] = useState<Day[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Moods the user picked that are not saved yet; shown instead of server data
  const [unsaved, setUnsaved] = useState<MoodByDay>({});

  // At most one request per day is in flight. A choice made while it is in
  // flight is kept here and sent when that request finishes, so the server
  // always ends up with the user's latest choice, whatever the response order.
  const inFlight = useRef(new Set<DayOfWeek>());
  const nextChoice = useRef<MoodByDay>({});

  const refreshDays = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await moodApi.fetchDays();
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

  const getDisplayMood = useCallback(
    (day: DayOfWeek): MoodType | null =>
      unsaved[day] ?? days.find((d) => d.day === day)?.mood ?? null,
    [days, unsaved]
  );

  const isPending = useCallback(
    (day: DayOfWeek): boolean => unsaved[day] !== undefined,
    [unsaved]
  );

  const saveLatestChoice = useCallback(async (day: DayOfWeek) => {
    inFlight.current.add(day);
    let lastError: unknown = null;

    let mood = nextChoice.current[day];
    while (mood !== undefined) {
      nextChoice.current = without(nextChoice.current, day);
      try {
        const { data } = await moodApi.updateMood(day, mood);
        setDays((current) => current.map((d) => (d.day === day ? data : d)));
        lastError = null;
      } catch (error) {
        lastError = error;
      }
      mood = nextChoice.current[day];
    }

    inFlight.current.delete(day);
    // Show server data again: the saved mood, or the previous one if the
    // latest save failed (rollback)
    setUnsaved((current) => without(current, day));

    if (lastError) {
      console.error("[MoodContext] updateDayMood: error", lastError);
      toast.error(`Failed to update ${formatDayOfWeek(day)} mood`, {
        description:
          lastError instanceof Error
            ? lastError.message
            : "Unknown error occurred",
        duration: 4000,
      });
    }
  }, []);

  const updateDayMood = useCallback(
    (day: DayOfWeek, mood: MoodType) => {
      setUnsaved((current) => ({ ...current, [day]: mood }));
      nextChoice.current = { ...nextChoice.current, [day]: mood };

      if (!inFlight.current.has(day)) {
        void saveLatestChoice(day);
      }
    },
    [saveLatestChoice]
  );

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

export function useMoods() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMoods must be used within MoodProvider");
  }
  return context;
}
