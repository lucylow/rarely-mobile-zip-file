import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
export function LoadingState({ label = "Loading…" }: { label?: string }) { return <View style={{ padding: 32, alignItems: "center", gap: 10 }}><ActivityIndicator /><Text>{label}</Text></View>; }
