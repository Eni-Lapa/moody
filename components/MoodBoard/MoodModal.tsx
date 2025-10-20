"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MOODS } from "@/constants/moods";
import { formatDayOfWeek } from "@/lib/utils";
import { MoodType, DayOfWeek } from "@/types/mood.types";
import { Check } from "lucide-react";

interface MoodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMood: (mood: MoodType) => void;
  currentMood?: MoodType | null;
  dayName?: string;
}

export function MoodModal({
  open,
  onOpenChange,
  onSelectMood,
  currentMood,
  dayName = "today",
}: MoodModalProps) {
  const handleSelectMood = (mood: MoodType) => {
    onSelectMood(mood);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            How are you feeling on{" "}
            {dayName ? formatDayOfWeek(dayName as DayOfWeek) : "today"}?
          </DialogTitle>
          <DialogDescription>
            Select a mood that best represents your day
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-4">
          {Object.entries(MOODS).map(([key, mood]) => (
            <Button
              key={key}
              variant={currentMood === mood.type ? "secondary" : "outline"}
              className="h-auto flex-col py-4 relative group transition-all hover:scale-105"
              onClick={() => handleSelectMood(mood.type)}
              style={{
                borderColor: currentMood === mood.type ? mood.color : undefined,
                backgroundColor:
                  currentMood === mood.type ? `${mood.color}15` : undefined,
              }}
            >
              <span className="text-2xl mb-2">{mood.emoji}</span>
              <span className="text-xs font-medium capitalize">
                {mood.type}
              </span>
              <div
                className="w-full h-1 rounded-full mt-2"
                style={{ backgroundColor: mood.color }}
              />
              {currentMood === mood.type && (
                <div className="absolute top-1 right-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
