import React from "react";
import { Text, View } from "react-native";
export function DegradedBanner({ message }: { message: string }) {
  return <View accessible accessibilityRole="alert" style={{ padding: 10, borderRadius: 14, backgroundColor: "#EFE7F2" }}><Text>{message}</Text></View>;
}
