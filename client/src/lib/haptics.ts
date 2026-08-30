import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export async function hapticSuccess(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Simulator / web-adjacent runtimes may not have a haptics engine.
  }
}
