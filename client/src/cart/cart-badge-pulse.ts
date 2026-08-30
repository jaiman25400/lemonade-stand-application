import { makeMutable, withSequence, withSpring } from "react-native-reanimated";

/** Lives outside React so the header badge can remount and still finish a pulse. */
export const cartBadgeScale = makeMutable(1);

export function pulseCartBadge(): void {
  cartBadgeScale.value = withSequence(
    withSpring(1.14, { damping: 10, stiffness: 240 }),
    withSpring(1, { damping: 14, stiffness: 180 }),
  );
}
