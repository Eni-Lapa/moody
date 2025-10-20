import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DayOfWeek } from "@/types/mood.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a day of the week for display
 * @param day - The day to format
 * @returns The formatted day name (e.g., "Monday")
 */
export function formatDayOfWeek(day: DayOfWeek): string {
  return capitalize(day);
}
