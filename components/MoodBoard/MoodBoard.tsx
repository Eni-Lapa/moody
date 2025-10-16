"use client";

import React, { useState } from "react";
import { MoodTile } from "./MoodTile";
import { MoodModal } from "./MoodModal";
import { useMoods } from "@/hooks/use-moods";
import { DAYS_OF_WEEK, MOODS } from "@/constants/moods";
import { DayOfWeek, MoodType } from "@/types/mood.types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function MoodBoard() {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { isLoading, getMoodForDay, updateMood } = useMoods();

  const handleTileClick = (day: DayOfWeek) => {
    setSelectedDay(day);
    setModalOpen(true);
  };

  const handleSelectMood = (mood: MoodType) => {
    if (selectedDay) {
      updateMood(selectedDay, mood);
    }
  };

  //   if (error) {
  //     return (
  //       <div className="flex items-center justify-center min-h-[400px]">
  //         <div className="text-center space-y-4">
  //           <Alert variant="destructive" className="max-w-md">
  //             <AlertDescription>
  //               Failed to load mood board. Please try again.
  //             </AlertDescription>
  //           </Alert>
  //           <Button onClick={() => window.location.reload()} variant="outline">
  //             <RefreshCw className="mr-2 h-4 w-4" />
  //             Retry
  //           </Button>
  //         </div>
  //       </div>
  //     );
  //   }

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
        {DAYS_OF_WEEK.map((day) => (
          <MoodTile
            key={day}
            day={day}
            mood={getMoodForDay(day)}
            onClick={() => handleTileClick(day)}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Stats Section */}
      {!isLoading && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">This Week's Summary</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(MOODS).map(([key, mood]) => {
              const count = DAYS_OF_WEEK.filter(
                (day) => getMoodForDay(day) === mood.type
              ).length;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: mood.color }}
                    />
                    <span className="text-sm">{mood.emoji}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Mood Legend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
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
