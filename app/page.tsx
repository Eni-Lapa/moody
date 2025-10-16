import { MoodBoard } from "@/components/MoodBoard/MoodBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-12">
        <MoodBoard />
      </div>
    </main>
  );
}
