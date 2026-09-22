import React from "react";
import { Pressable, Text, View } from "react-native";
export function EmptyState({ title, detail, action, onAction }: { title: string; detail: string; action?: string; onAction?: () => void }) { return <View style={{ padding: 28, alignItems: "center", gap: 10 }}><Text style={{ fontSize: 18, fontWeight: "800" }}>{title}</Text><Text style={{ textAlign: "center", color: "#7E6F7D" }}>{detail}</Text>{action && onAction ? <Pressable onPress={onAction} style={{ padding: 12 }}><Text style={{ fontWeight: "700" }}>{action}</Text></Pressable> : null}</View>; }
