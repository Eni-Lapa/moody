"use client";

import { MoodProvider } from "@/contexts/MoodContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MoodProvider>
      {children}
      <Toaster />
    </MoodProvider>
  );
}
