import React from "react";
import { Pressable, Text, View } from "react-native";
import { fingerprintError, normalizeError, type ErrorDetails } from "../lib/release";

interface Props { children: React.ReactNode; onReport?: (error: ErrorDetails) => void; }
interface State { failed: boolean; error?: ErrorDetails; };

export class HardenedAppErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(error: unknown): State {
    const details = normalizeError(error, { operation: "render" });
    return { failed: true, error: { ...details, fingerprint: fingerprintError(details) } };
  }

  componentDidCatch(error: unknown): void {
    const details = normalizeError(error, { operation: "render" });
    this.props.onReport?.(details);
  }

  private retry = (): void => {
    this.setState({ failed: false, error: undefined });
  };

  render(): React.ReactNode {
    if (!this.state.failed || !this.state.error) return this.props.children;
    return (
      <View accessibilityRole="alert" style={{ flex: 1, justifyContent: "center", padding: 24, gap: 14, backgroundColor: "#FBF8F3" }}>
        <Text style={{ fontSize: 26, fontWeight: "900", color: "#2B1D2F" }}>RARELY needs a reset.</Text>
        <Text style={{ color: "#7E6F7D" }}>{this.state.error.safeMessage}</Text>
        <Pressable accessibilityRole="button" onPress={this.retry} style={{ padding: 14, borderRadius: 16, backgroundColor: "#E96F61" }}>
          <Text style={{ textAlign: "center", fontWeight: "800", color: "#FFFFFF" }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
