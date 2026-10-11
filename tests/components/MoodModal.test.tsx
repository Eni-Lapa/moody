import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MoodModal } from "@/components/MoodBoard/MoodModal";

function renderModal(currentMood: "happy" | null = null) {
  const onSelectMood = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <MoodModal
      open
      onOpenChange={onOpenChange}
      onSelectMood={onSelectMood}
      currentMood={currentMood}
      dayName="wednesday"
    />
  );
  return { onSelectMood, onOpenChange };
}

describe("MoodModal", () => {
  it("asks about the selected day and offers every mood", () => {
    renderModal();

    expect(
      screen.getByRole("dialog", { name: "How are you feeling on Wednesday?" })
    ).toBeInTheDocument();
    for (const mood of [
      "happy",
      "tired",
      "focused",
      "stressed",
      "relaxed",
      "neutral",
    ]) {
      expect(
        screen.getByRole("button", { name: new RegExp(mood) })
      ).toBeInTheDocument();
    }
  });

  it("marks the current mood as pressed", () => {
    renderModal("happy");

    expect(screen.getByRole("button", { name: /happy/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: /tired/ })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("selects a mood and closes", async () => {
    const { onSelectMood, onOpenChange } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: /relaxed/ }));

    expect(onSelectMood).toHaveBeenCalledWith("relaxed");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
