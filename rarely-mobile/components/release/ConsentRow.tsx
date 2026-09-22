import React from "react";
import { Switch, Text, View } from "react-native";
export function ConsentRow({ title, detail, value, onChange }: { title: string; detail: string; value: boolean; onChange: (next: boolean) => void }) {
  return <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}><View style={{ flex: 1, gap: 3 }}><Text style={{ fontWeight: "700" }}>{title}</Text><Text style={{ color: "#7E6F7D" }}>{detail}</Text></View><Switch value={value} onValueChange={onChange} /></View>;
}
