import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
export function ActionButton({ title, busy, disabled, onPress }: { title: string; busy?: boolean; disabled?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ busy, disabled }} disabled={disabled || busy} onPress={onPress} style={{ minHeight: 52, borderRadius: 18, justifyContent: "center", alignItems: "center", paddingHorizontal: 18, backgroundColor: disabled ? "#EDE4E0" : "#E96F61" }}>
    {busy ? <ActivityIndicator /> : <Text style={{ fontWeight: "800", color: disabled ? "#7E6F7D" : "#FFFFFF" }}>{title}</Text>}
  </Pressable>;
}
