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
  emoji: string;
}

export interface DayMood {
  day: DayOfWeek;
  mood: MoodType | null;
}

export interface MoodBoardState {
  days: DayMood[];
}

export interface UpdateMoodRequest {
  day: DayOfWeek;
  mood: MoodType | null;
}

export interface UpdateMoodResponse {
  success: boolean;
  data?: DayMood | null;
  error?: string;
}

export interface MoodStats {
  stats: Array<{
    mood: string;
    emoji: string;
    color: string;
    count: number;
  }>;
  recentChanges: Array<{
    day: string;
    previous_mood: string | null;
    new_mood: string | null;
    changed_at: string;
  }>;
}

export interface DayMoodWithMetadata extends DayMood {
  emoji?: string | null;
  color?: string | null;
  updatedAt?: string | null;
}
