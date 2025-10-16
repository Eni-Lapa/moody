import type { Mood, MoodType, DayOfWeek } from "@/types/mood.types";

export const MOODS: Record<MoodType, Mood> = {
  happy: {
    type: "happy",
    color: "#FACC15",
    emoji: "😊",
  },
  tired: {
    type: "tired",
    color: "#60A5FA",
    emoji: "😴",
  },
  focused: {
    type: "focused",
    color: "#14B8A6",
    emoji: "🎯",
  },
  stressed: {
    type: "stressed",
    color: "#EF4444",
    emoji: "😰",
  },
  relaxed: {
    type: "relaxed",
    color: "#A78BFA",
    emoji: "😌",
  },
  neutral: {
    type: "neutral",
    color: "#64748B",
    emoji: "😐",
  },
};

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
