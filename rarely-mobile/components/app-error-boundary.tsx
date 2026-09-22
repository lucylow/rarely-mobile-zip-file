import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { reportNonFatalError } from "@/lib/non-fatal-error";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportNonFatalError("app:render-boundary", error, {
      componentStack: info.componentStack,
    });
  }

  retry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container} accessibilityLiveRegion="assertive">
        <Text style={styles.eyebrow}>RARELY</Text>
        <Text style={styles.title}>Something needs a softer restart.</Text>
        <Text style={styles.body}>The screen could not finish loading. Your local journal and private images were not changed.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Retry the screen" onPress={this.retry} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#FBF8F3" },
  eyebrow: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 1.8 },
  title: { color: "#2B1D2F", fontSize: 30, lineHeight: 36, fontWeight: "700", marginTop: 16 },
  body: { color: "#7E6F7D", fontSize: 15, lineHeight: 22, marginTop: 12 },
  button: { alignSelf: "flex-start", backgroundColor: "#2B1D2F", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 13, marginTop: 22 },
  buttonText: { color: "#FFF7F2", fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
