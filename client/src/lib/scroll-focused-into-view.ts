import type { RefObject } from "react";
import type { ScrollView, View } from "react-native";

/**
 * Scrolls a focused field into the visible portion of a ScrollView.
 * Measures the field and the scroll viewport in window space, then adjusts
 * contentOffset so the field sits fully inside that viewport.
 * Call after the keyboard has opened so the viewport height is final.
 */
export function scrollFocusedIntoView(
  scrollRef: RefObject<ScrollView | null>,
  viewport: View | null,
  field: View | null,
  contentOffsetY: number,
  bottomGutter = 20,
): void {
  const scroll = scrollRef.current;
  if (!scroll || !viewport || !field) {
    return;
  }

  field.measureInWindow((_fx: number, fieldY: number, _fw: number, fieldH: number) => {
    viewport.measureInWindow((_sx: number, scrollY: number, _sw: number, scrollH: number) => {
      if (scrollH <= 0) {
        return;
      }

      const topPad = 12;
      const visibleTop = scrollY + topPad;
      const visibleBottom = scrollY + scrollH - bottomGutter;
      const fieldTop = fieldY;
      const fieldBottom = fieldY + fieldH;

      let delta = 0;
      if (fieldTop < visibleTop) {
        delta = fieldTop - visibleTop;
      } else if (fieldBottom > visibleBottom) {
        delta = fieldBottom - visibleBottom;
      }

      if (delta === 0) {
        return;
      }

      scroll.scrollTo({
        y: Math.max(0, contentOffsetY + delta),
        animated: true,
      });
    });
  });
}
