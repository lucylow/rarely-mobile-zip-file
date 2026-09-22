import { Pressable, StyleSheet, Text, View } from "react-native";
import { FadeInView } from "@/components/ui/fade-in-view";

type RecoveryCardProps = {
  title: string;
  message: string;
  retryLabel: string;
  onRetry: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryDestructive?: boolean;
};

export function RecoveryCard({ title, message, retryLabel, onRetry, secondaryLabel, onSecondary, secondaryDestructive = false }: RecoveryCardProps) {
  return (
    <FadeInView duration={220} distance={5}>
      <View accessibilityLiveRegion="polite" style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel={retryLabel} onPress={onRetry} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>{retryLabel}</Text>
          </Pressable>
          {secondaryLabel && onSecondary ? <Pressable accessibilityRole="button" accessibilityLabel={secondaryLabel} onPress={onSecondary} style={({ pressed }) => [styles.secondary, secondaryDestructive && styles.destructive, pressed && styles.pressed]}>
            <Text style={[styles.secondaryText, secondaryDestructive && styles.destructiveText]}>{secondaryLabel}</Text>
          </Pressable> : null}
        </View>
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFF7F2", borderColor: "#E5D8D4", borderWidth: 1, borderRadius: 18, padding: 14, marginTop: 16 },
  title: { color: "#2B1D2F", fontSize: 14, fontWeight: "700" },
  message: { color: "#7E6F7D", fontSize: 12, lineHeight: 17, marginTop: 5 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  primary: { backgroundColor: "#2B1D2F", borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9 },
  primaryText: { color: "#FFF7F2", fontSize: 12, fontWeight: "700" },
  secondary: { backgroundColor: "#F3E5E1", borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9 },
  secondaryText: { color: "#5F4A5E", fontSize: 12, fontWeight: "700" },
  destructive: { backgroundColor: "#F5D7CF" },
  destructiveText: { color: "#A34C4C" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
