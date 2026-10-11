export type MoodType =
  | "happy"
  | "tired"
  | "focused"
  | "stressed"
  | "relaxed"
  | "neutral";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Mood {
  type: MoodType;
  color: string;
  /** Text colour with at least 4.5:1 contrast on `color` (WCAG AA) */
  textColor: string;
  emoji: string;
}

export interface Day {
  day: DayOfWeek;
  mood: MoodType | null;
}

export interface UpdateMoodResponse {
  success: boolean;
  data: Day;
  error?: string;
}
