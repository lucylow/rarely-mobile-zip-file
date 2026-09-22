import React from "react";
import { Text, View } from "react-native";
import type { StorePackage } from "../../lib/release/purchases/types";
export function PriceRow({ item, selected }: { item: StorePackage; selected: boolean }) {
  return <View accessibilityState={{ selected }} style={{ padding: 14, borderRadius: 16, borderWidth: selected ? 2 : 1, borderColor: selected ? "#E96F61" : "#EDE4E0", gap: 4 }}><Text style={{ fontWeight: "700" }}>{item.title}</Text><Text>{item.priceString}{item.period ? ` · ${item.period}` : ""}</Text><Text style={{ color: "#7E6F7D" }}>{item.description}</Text></View>;
}
