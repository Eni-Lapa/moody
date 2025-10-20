"use client";

import React from "react";
import { DayOfWeek, MoodType } from "@/types/mood.types";
import { MOODS } from "@/constants/moods";
import { cn } from "@/lib/utils";
import { formatDayOfWeek } from "@/lib/utils";
import { Loader2, Plus } from "lucide-react";

interface MoodTileProps {
  day: DayOfWeek;
  mood: MoodType | null;
  onClick: () => void;
  isPending?: boolean;
}

export function MoodTile({
  day,
  mood,
  onClick,
  isPending = false,
}: MoodTileProps) {
  const moodData = mood ? MOODS[mood] : null;
  const formattedDay = formatDayOfWeek(day);

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "relative group flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300",
        "hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        "min-h-[140px] cursor-pointer",
        "disabled:cursor-wait",
        moodData
          ? "border-transparent shadow-lg"
          : "border-border hover:border-primary/50 bg-card"
      )}
      style={{
        backgroundColor: moodData ? moodData.color : undefined,
        borderColor: moodData ? moodData.color : undefined,
      }}
      aria-label={`${formattedDay} mood: ${mood || "not set"}`}
      aria-busy={isPending}
    >
      {/* Day label */}
      <div
        className={cn(
          "absolute top-3 left-3 text-sm font-medium",
          moodData ? "text-white/90" : "text-foreground"
        )}
      >
        {formattedDay}
      </div>

      {/* Pending indicator badge */}
      {isPending && (
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 rounded-full p-1">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          </div>
        </div>
      )}

      {/* Mood emoji */}
      {moodData && (
        <span
          className={cn(
            "text-4xl mb-2 animate-in zoom-in-50 duration-300",
            isPending && "opacity-70"
          )}
          role="img"
          aria-label={mood ?? ""}
        >
          {moodData.emoji}
        </span>
      )}

      {/* Empty state */}
      {!moodData && !isPending && (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center group-hover:border-primary transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs">Set mood</span>
        </div>
      )}

      {/* Loading state for empty tiles */}
      {!moodData && isPending && (
        <div className="flex flex-col items-center gap-2 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-xs font-medium">Updating...</span>
        </div>
      )}

      {/* Hover effect for unset mood tiles */}
      {!moodData && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
      )}
    </button>
  );
}
