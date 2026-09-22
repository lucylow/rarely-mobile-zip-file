import * as Haptics from "expo-haptics";

export async function triggerLightImpact(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Ignore haptics failures on unsupported devices.
  }
}

export async function triggerSuccessNotification(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignore haptics failures on unsupported devices.
  }
}
