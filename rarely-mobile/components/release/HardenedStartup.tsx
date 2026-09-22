import React, { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import { bannerForStartup, runStartup, type StartupReport } from "@/lib/release";
import { configureRevenueCat } from "@/lib/release/purchases/nativeRevenueCat";

export function HardenedStartup({ children }: { children: React.ReactNode }) {
  const [report, setReport] = useState<StartupReport>();

  useEffect(() => {
    void runStartup([
      { id: "local-storage", critical: true, run: async () => undefined },
      { id: "session", critical: false, run: async () => undefined },
      { id: "membership", critical: false, run: async () => { if (Platform.OS === "ios") await configureRevenueCat(); } },
      { id: "notifications", critical: false, run: async () => undefined },
    ]).then(setReport);
  }, []);

  if (!report) {
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text>Opening RARELY...</Text></View>;
  }

  if (report.criticalFailure) {
    return <View style={{ flex: 1, justifyContent: "center", padding: 24 }}><Text>{bannerForStartup(report)}</Text></View>;
  }

  const banner = bannerForStartup(report);
  return <View style={{ flex: 1 }}>{banner ? <View accessibilityRole="alert" style={{ padding: 8, backgroundColor: "#F3E4DD" }}><Text style={{ textAlign: "center" }}>{banner}</Text></View> : null}{children}</View>;
}