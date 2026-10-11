import { describe, expect, it } from "vitest";
import { MOODS } from "@/constants/moods";

// WCAG 2 relative luminance and contrast ratio
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

describe("MOODS", () => {
  it.each(Object.values(MOODS))(
    "$type has a readable label colour (WCAG AA, 4.5:1)",
    ({ color, textColor }) => {
      expect(contrast(color, textColor)).toBeGreaterThanOrEqual(4.5);
    }
  );
});
