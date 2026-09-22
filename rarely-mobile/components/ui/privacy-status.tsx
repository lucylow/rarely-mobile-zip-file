import { StyleSheet, Text, View } from "react-native";

export function PrivacyStatus({ visible }: { visible: boolean }) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Private note previews are ${visible ? "visible" : "hidden"}`}
      style={[styles.container, visible ? styles.visible : styles.hidden]}
    >
      <Text style={styles.dot}>•</Text>
      <Text style={styles.label}>{visible ? "PRIVATE PREVIEWS ON" : "PRIVATE PREVIEWS HIDDEN"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6, marginTop: 12 },
  visible: { backgroundColor: "#F5D7CF" },
  hidden: { backgroundColor: "#EDE4E0" },
  dot: { color: "#B96861", fontSize: 16, lineHeight: 13, marginRight: 5 },
  label: { color: "#5F4A5E", fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
});
