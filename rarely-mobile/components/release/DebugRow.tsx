import React from "react";
import { Text, View } from "react-native";
export function DebugRow({ label, value }: { label: string; value: string }) { return <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#EDE4E0" }}><Text>{label}</Text><Text style={{ color: "#7E6F7D" }}>{value}</Text></View>; }
