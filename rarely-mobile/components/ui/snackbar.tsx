import { useEffect } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { createAppTheme, type AppTheme } from "@/lib/design/theme";
import { hitTargets, radii, spacing, typography } from "@/lib/design/tokens";

type SnackbarProps = {
  message: string | null;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
  bottomOffset?: number;
};

export function Snackbar({ message, actionLabel, onAction, onDismiss, duration = 2800, bottomOffset = 0 }: SnackbarProps) {
  const insets = useSafeAreaInsets();
  const theme = createAppTheme(useColors());
  const styles = createStyles(theme);
  useEffect(() => {
    if (!message) return;
    void AccessibilityInfo.announceForAccessibility(message);
    const timeout = setTimeout(onDismiss, duration);
    return () => clearTimeout(timeout);
  }, [duration, message, onDismiss]);

  if (!message) return null;

  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.container, { bottom: 18 + insets.bottom + bottomOffset }]}>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={onDismiss} hitSlop={6} style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}>
        <Text style={styles.dismissText}>✕</Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: { position: "absolute", left: spacing.lg, right: spacing.lg, backgroundColor: theme.ink, borderRadius: radii.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md, boxShadow: `0px 5px ${spacing.md}px rgba(43,29,47,0.18)` },
    message: { flex: 1, color: theme.canvas, fontSize: typography.card.fontSize - 1, lineHeight: typography.card.lineHeight - 2 },
    action: { minHeight: hitTargets.compact, justifyContent: "center", paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
    actionText: { color: theme.accent, fontSize: typography.card.fontSize - 1, lineHeight: typography.card.lineHeight, fontWeight: "800" },
    dismiss: { minWidth: hitTargets.compact, minHeight: hitTargets.compact, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
    dismissText: { color: theme.mutedInk, fontSize: 14, fontWeight: "800" },
    pressed: { opacity: 0.65 },
  });
}

export type { SnackbarProps };

const _brand = "RARELY";
void _brand;

// Keep this component intentionally small: it is local feedback, not a persistent notification system.
