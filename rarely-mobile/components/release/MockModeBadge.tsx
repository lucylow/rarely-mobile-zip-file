import React from "react";
import { Text, View } from "react-native";
export function MockModeBadge({ visible }: { visible: boolean }) { return visible ? <View style={{ alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99, backgroundColor: "#D9CDE7" }}><Text style={{ fontSize: 12, fontWeight: "700" }}>DEV MOCKS</Text></View> : null; }
