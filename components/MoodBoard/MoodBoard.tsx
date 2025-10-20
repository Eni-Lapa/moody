"use client";

import React, { useState } from "react";
import { MoodTile } from "./MoodTile";
import { MoodModal } from "./MoodModal";
import { useMoods } from "@/hooks/use-moods";
import { MOODS } from "@/constants/moods";
import { Day, DayOfWeek, MoodType } from "@/types/mood.types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMoodContext } from "@/contexts/MoodContext";

export function MoodBoard() {
  const { days } = useMoodContext();
  const { isLoading, updateSelectedDayMood } = useMoods();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Helper function to get the mood for a selected day
  const getMoodForDay = (day: DayOfWeek) => {
    const found = days.find((d) => d.day === day);
    return found?.mood ?? null;
  };

  const handleTileClick = (day: DayOfWeek) => {
    setSelectedDay(day);
    setModalOpen(true);
  };

  const handleSelectMood = (mood: MoodType) => {
    if (selectedDay) {
      updateSelectedDayMood(selectedDay, mood);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Weekly Mood Tracker
        </h1>
        <p className="text-muted-foreground">
          Track how you're feeling throughout the week
        </p>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 7 }).map((_, idx) => (
              <Skeleton key={idx} className="aspect-square w-full rounded-xl" />
            ))
          : days.map((day: Day) => (
              <MoodTile
                key={day.day}
                day={day.day}
                mood={day.mood}
                onClick={() => handleTileClick(day.day)}
              />
            ))}
      </div>

      {/* Legend */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Mood Legend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(MOODS).map(([key, mood]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: mood.color }}
              />
              <span className="text-xs capitalize">{mood.type}</span>
              <span className="text-sm">{mood.emoji}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <MoodModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectMood={handleSelectMood}
        currentMood={selectedDay ? getMoodForDay(selectedDay) : null}
        dayName={selectedDay || undefined}
      />
    </div>
  );
}
