import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MoodTile } from "@/components/MoodBoard/MoodTile";

describe("MoodTile", () => {
  it("invites the user to set a mood when the day is empty", () => {
    render(<MoodTile day="monday" mood={null} onClick={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Monday mood: not set" })
    ).toBeInTheDocument();
    expect(screen.getByText("Set mood")).toBeInTheDocument();
  });

  it("shows the mood's emoji when a mood is set", () => {
    render(<MoodTile day="friday" mood="focused" onClick={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Friday mood: focused" })
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "focused" })).toHaveTextContent(
      "🎯"
    );
  });

  it("stays clickable while a save is pending", async () => {
    const onClick = vi.fn();
    render(
      <MoodTile day="monday" mood="happy" onClick={onClick} isPending />
    );

    const tile = screen.getByRole("button", { name: "Monday mood: happy" });
    expect(tile).toHaveAttribute("aria-busy", "true");

    await userEvent.click(tile);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
