import React from "react";
import { Pressable, Text, View } from "react-native";
import type { ErrorDetails } from "../../lib/release/errors/types";
import { actionLabel } from "../../lib/release/errors/userMessage";

export function ReleaseErrorCard({ error, onAction, onDismiss }: { error: ErrorDetails; onAction?: () => void; onDismiss?: () => void }) {
  const action = actionLabel(error);
  return (
    <View accessible accessibilityRole="alert" style={{ padding: 16, borderRadius: 18, backgroundColor: "#F8EEEB", gap: 8 }}>
      <Text style={{ fontWeight: "700", fontSize: 16, color: "#2B1D2F" }}>{error.safeMessage}</Text>
      {error.retryable && <Text style={{ color: "#7E6F7D" }}>Your saved local work is kept safe.</Text>}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {action && onAction && <Pressable accessibilityRole="button" onPress={onAction} style={{ padding: 10 }}><Text style={{ fontWeight: "700" }}>{action}</Text></Pressable>}
        {onDismiss && <Pressable accessibilityRole="button" onPress={onDismiss} style={{ padding: 10 }}><Text>Dismiss</Text></Pressable>}
      </View>
    </View>
  );
}
