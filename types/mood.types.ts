export type MoodType =
  | "happy"
  | "tired"
  | "focused"
  | "stressed"
  | "relaxed"
  | "neutral";

export type CurrentMoodType = MoodType | null;

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
  emoji: string;
}

export interface Day {
  day: DayOfWeek;
  mood: MoodType | null;
}

export interface UpdateMoodRequest {
  mood: MoodType;
}

export interface UpdateMoodResponse {
  success: boolean;
  data: Day;
  error?: string;
}
