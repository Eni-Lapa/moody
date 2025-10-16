"use client";

import React from "react";
import { DayOfWeek, MoodType } from "@/types/mood.types";
import { MOODS } from "@/constants/moods";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, Plus } from "lucide-react";

interface MoodTileProps {
  day: DayOfWeek;
  mood: MoodType | null;
  onClick: () => void;
  isPending?: boolean;
  error?: string | null;
  isLoading?: boolean;
}

export function MoodTile({
  day,
  mood,
  onClick,
  isPending = false,
  error,
  isLoading = false,
}: MoodTileProps) {
  const moodData = mood ? MOODS[mood] : null;

  if (isLoading) {
    return <Skeleton className="h-[140px] rounded-xl" />;
  }

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "relative group flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300",
        "hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2",
        "min-h-[140px] cursor-pointer",
        "disabled:cursor-wait disabled:opacity-90",
        moodData
          ? "border-transparent shadow-lg"
          : "border-border hover:border-primary/50 bg-card",
        error && "border-destructive bg-destructive/5"
      )}
      style={{
        backgroundColor: moodData && !error ? moodData.color : undefined,
        borderColor: moodData && !error ? moodData.color : undefined,
      }}
      aria-label={`${day} mood: ${mood || "not set"}`}
      aria-busy={isPending}
    >
      {/* Day label */}
      <div
        className={cn(
          "absolute top-3 left-3 text-sm font-medium",
          moodData ? "text-white/90" : "text-foreground"
        )}
      >
        {day}
      </div>

      {/* Mood emoji */}
      {moodData && !error && (
        <span
          className="text-4xl mb-2 animate-in zoom-in-50 duration-300"
          role="img"
          aria-label={mood ?? ""}
        >
          {moodData.emoji}
        </span>
      )}

      {/* Empty state */}
      {!moodData && !error && !isPending && (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center group-hover:border-primary transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs">Set mood</span>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="absolute inset-0 bg-background/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <span className="text-xs font-medium">Failed to update</span>
        </div>
      )}

      {/* Hover effect for empty tiles */}
      {!moodData && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
      )}
    </button>
  );
}
