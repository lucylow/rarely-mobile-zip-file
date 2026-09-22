import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { MemoryItem } from "../../lib/ux/upgrade/types";
import { MemoryCard } from "./MemoryCard";

export function MemorySection({ memories, onRemove }: { memories: MemoryItem[]; onRemove?: (memory: MemoryItem) => void }) {
  return <View style={styles.section}><Text style={styles.title}>What RARELY remembers</Text><Text style={styles.copy}>Small, editable signals—not a score of who you are.</Text>{memories.length ? memories.map((memory) => <MemoryCard key={memory.id} memory={memory} onRemove={onRemove} />) : <Text style={styles.empty}>Nothing here yet. Keep using the app normally.</Text>}</View>;
}

const styles = StyleSheet.create({ section: { gap: 10 }, title: { fontSize: 22, fontWeight: "800", color: "#3B293A" }, copy: { color: "#6C596F", lineHeight: 20 }, empty: { color: "#7C6B77", lineHeight: 20, marginTop: 5 } });