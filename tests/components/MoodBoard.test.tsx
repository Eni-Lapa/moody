import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { moodApi } from "@/app/services/mood.api";
import { MoodBoard } from "@/components/MoodBoard/MoodBoard";
import { DAYS_OF_WEEK } from "@/constants/moods";
import { MoodProvider } from "@/contexts/MoodContext";

vi.mock("@/app/services/mood.api", () => ({
  moodApi: { fetchDays: vi.fn(), updateMood: vi.fn() },
}));

function renderBoard() {
  vi.mocked(moodApi.fetchDays).mockResolvedValue(
    DAYS_OF_WEEK.map((day) => ({ day, mood: null }))
  );
  render(
    <MoodProvider>
      <MoodBoard />
    </MoodProvider>
  );
}

describe("MoodBoard", () => {
  it("lets the user set a day's mood", async () => {
    vi.mocked(moodApi.updateMood).mockResolvedValue({
      success: true,
      data: { day: "tuesday", mood: "happy" },
    });
    renderBoard();

    await userEvent.click(
      await screen.findByRole("button", { name: "Tuesday mood: not set" })
    );
    await userEvent.click(screen.getByRole("button", { name: /happy/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Tuesday mood: happy" })
    ).toBeInTheDocument();
    expect(moodApi.updateMood).toHaveBeenCalledWith("tuesday", "happy");
  });

  it("works with the keyboard alone", async () => {
    const user = userEvent.setup();
    renderBoard();
    const monday = await screen.findByRole("button", {
      name: "Monday mood: not set",
    });

    await user.tab();
    expect(monday).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("dialog", { name: "How are you feeling on Monday?" })
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(moodApi.updateMood).not.toHaveBeenCalled();
  });
});
