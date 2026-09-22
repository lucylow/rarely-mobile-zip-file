import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
export function ConfirmDialog({ visible, title, detail, confirmLabel, onCancel, onConfirm }: { visible: boolean; title: string; detail: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void }) {
  return <Modal transparent visible={visible} animationType="fade"><View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(0,0,0,.28)" }}><View style={{ padding: 20, borderRadius: 22, backgroundColor: "white", gap: 12 }}><Text style={{ fontSize: 20, fontWeight: "800" }}>{title}</Text><Text>{detail}</Text><Pressable onPress={onConfirm} style={{ padding: 12 }}><Text style={{ fontWeight: "800" }}>{confirmLabel}</Text></Pressable><Pressable onPress={onCancel} style={{ padding: 12 }}><Text>Cancel</Text></Pressable></View></View></Modal>;
}
