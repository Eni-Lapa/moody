import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { moodApi } from "@/app/services/mood.api";
import { DAYS_OF_WEEK } from "@/constants/moods";
import { MoodProvider, useMoods } from "@/contexts/MoodContext";
import type {
  Day,
  DayOfWeek,
  MoodType,
  UpdateMoodResponse,
} from "@/types/mood.types";

vi.mock("@/app/services/mood.api", () => ({
  moodApi: { fetchDays: vi.fn(), updateMood: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const fetchDays = vi.mocked(moodApi.fetchDays);
const updateMood = vi.mocked(moodApi.updateMood);

function week(moods: Partial<Record<DayOfWeek, MoodType>> = {}): Day[] {
  return DAYS_OF_WEEK.map((day) => ({ day, mood: moods[day] ?? null }));
}

function saved(day: DayOfWeek, mood: MoodType): UpdateMoodResponse {
  return { success: true, data: { day, mood } };
}

/** A response the test resolves or rejects by hand, to control timing. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function wrapper({ children }: { children: ReactNode }) {
  return <MoodProvider>{children}</MoodProvider>;
}

async function renderMoods(days: Day[] = week()) {
  fetchDays.mockResolvedValue(days);
  const { result } = renderHook(() => useMoods(), { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return result;
}

describe("MoodProvider", () => {
  it("loads the week from the server", async () => {
    const moods = await renderMoods(week({ monday: "tired" }));

    expect(moods.current.getDisplayMood("monday")).toBe("tired");
    expect(moods.current.getDisplayMood("tuesday")).toBeNull();
  });

  it("shows a new mood immediately and marks the day pending until saved", async () => {
    const moods = await renderMoods();
    const save = deferred<UpdateMoodResponse>();
    updateMood.mockReturnValueOnce(save.promise);

    act(() => moods.current.updateDayMood("monday", "happy"));

    expect(moods.current.getDisplayMood("monday")).toBe("happy");
    expect(moods.current.isPending("monday")).toBe(true);

    await act(async () => save.resolve(saved("monday", "happy")));

    expect(moods.current.isPending("monday")).toBe(false);
    expect(moods.current.days[0]).toEqual({ day: "monday", mood: "happy" });
  });

  it("sends one request per day at a time and finishes with the latest choice", async () => {
    const moods = await renderMoods();
    const first = deferred<UpdateMoodResponse>();
    const second = deferred<UpdateMoodResponse>();
    updateMood
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    act(() => moods.current.updateDayMood("monday", "happy"));
    act(() => moods.current.updateDayMood("monday", "tired"));
    act(() => moods.current.updateDayMood("monday", "stressed"));

    // Later choices wait for the request in flight; only the latest is kept
    expect(updateMood).toHaveBeenCalledTimes(1);
    expect(moods.current.getDisplayMood("monday")).toBe("stressed");

    await act(async () => first.resolve(saved("monday", "happy")));
    await waitFor(() => expect(updateMood).toHaveBeenCalledTimes(2));
    expect(updateMood).toHaveBeenLastCalledWith("monday", "stressed");
    // The older response does not flash the older mood on screen
    expect(moods.current.getDisplayMood("monday")).toBe("stressed");
    expect(moods.current.isPending("monday")).toBe(true);

    await act(async () => second.resolve(saved("monday", "stressed")));

    expect(moods.current.isPending("monday")).toBe(false);
    expect(moods.current.getDisplayMood("monday")).toBe("stressed");
  });

  it("saves different days independently", async () => {
    const moods = await renderMoods();
    updateMood.mockReturnValue(new Promise(() => {}));

    act(() => moods.current.updateDayMood("monday", "happy"));
    act(() => moods.current.updateDayMood("tuesday", "tired"));

    expect(updateMood).toHaveBeenCalledWith("monday", "happy");
    expect(updateMood).toHaveBeenCalledWith("tuesday", "tired");
  });

  it("rolls back to the saved mood and explains why when a save fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const moods = await renderMoods(week({ monday: "tired" }));
    updateMood.mockRejectedValueOnce(new Error("Failed to update mood"));

    act(() => moods.current.updateDayMood("monday", "happy"));
    expect(moods.current.getDisplayMood("monday")).toBe("happy");

    await waitFor(() => expect(moods.current.isPending("monday")).toBe(false));
    expect(moods.current.getDisplayMood("monday")).toBe("tired");
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to update Monday mood",
      expect.objectContaining({ description: "Failed to update mood" })
    );
  });

  it("keeps the latest choice when only an earlier save fails", async () => {
    const moods = await renderMoods();
    const first = deferred<UpdateMoodResponse>();
    updateMood
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(saved("monday", "relaxed"));

    act(() => moods.current.updateDayMood("monday", "happy"));
    act(() => moods.current.updateDayMood("monday", "relaxed"));
    await act(async () => first.reject(new Error("Network error")));

    await waitFor(() => expect(moods.current.isPending("monday")).toBe(false));
    expect(moods.current.getDisplayMood("monday")).toBe("relaxed");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("offers a retry when the week fails to load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchDays.mockRejectedValueOnce(new Error("Failed to fetch days"));

    renderHook(() => useMoods(), { wrapper });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to load your moods",
        expect.objectContaining({
          action: expect.objectContaining({ label: "Retry" }),
        })
      )
    );
  });
});
