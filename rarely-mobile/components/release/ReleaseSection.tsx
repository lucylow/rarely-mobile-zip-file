import React from "react";
import { Text, View } from "react-native";
export function ReleaseSection({ title, children }: { title: string; children: React.ReactNode }) { return <View style={{ gap: 10, marginBottom: 18 }}><Text style={{ fontWeight: "800", fontSize: 16 }}>{title}</Text>{children}</View>; }
