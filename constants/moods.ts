import type { Mood, MoodType, DayOfWeek } from "@/types/mood.types";

export const MOODS: Record<MoodType, Mood> = {
  happy: {
    type: "happy",
    color: "#FACC15",
    textColor: "#020617",
    emoji: "🙂",
  },
  tired: {
    type: "tired",
    color: "#60A5FA",
    textColor: "#020617",
    emoji: "😪",
  },
  focused: {
    type: "focused",
    color: "#14B8A6",
    textColor: "#020617",
    emoji: "🎯",
  },
  stressed: {
    type: "stressed",
    color: "#EF4444",
    textColor: "#020617",
    emoji: "😖",
  },
  relaxed: {
    type: "relaxed",
    color: "#A78BFA",
    textColor: "#020617",
    emoji: "🧘",
  },
  neutral: {
    type: "neutral",
    color: "#64748B",
    textColor: "#FFFFFF",
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

export const MOOD_TYPES = Object.keys(MOODS) as MoodType[];

export function isMoodType(value: unknown): value is MoodType {
  return typeof value === "string" && MOOD_TYPES.includes(value as MoodType);
}

export function isDayOfWeek(value: string): value is DayOfWeek {
  return DAYS_OF_WEEK.includes(value as DayOfWeek);
}
