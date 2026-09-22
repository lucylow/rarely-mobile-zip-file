import React from "react";
import { Text, View } from "react-native";
export function OfflineBanner({ visible, message = "Offline mode · your saved moments are still here" }: { visible: boolean; message?: string }) {
  if (!visible) return null;
  return <View accessibilityRole="alert" style={{ paddingVertical: 7, paddingHorizontal: 12, backgroundColor: "#F3E4DD" }}><Text style={{ textAlign: "center" }}>{message}</Text></View>;
}
