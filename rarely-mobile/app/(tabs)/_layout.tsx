import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 64 + bottomPadding,
          paddingTop: 10,
          paddingBottom: bottomPadding,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          boxShadow: "0px -2px 10px rgba(43,29,47,0.08)",
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarAccessibilityLabel: "Home tab", tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={23} color={color} /> }} />
      <Tabs.Screen name="create" options={{ title: "Create", tabBarAccessibilityLabel: "Create tab", tabBarIcon: ({ color }) => <IconSymbol name="sparkles" size={23} color={color} /> }} />
      <Tabs.Screen name="community" options={{ title: "Community", tabBarAccessibilityLabel: "Community tab", tabBarIcon: ({ color }) => <IconSymbol name="person.3.fill" size={23} color={color} /> }} />
      <Tabs.Screen name="studio" options={{ title: "Studio", tabBarAccessibilityLabel: "Rare Studio tab", tabBarIcon: ({ color }) => <IconSymbol name="paintpalette.fill" size={23} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarAccessibilityLabel: "Profile tab", tabBarIcon: ({ color }) => <IconSymbol name="person.crop.circle.fill" size={23} color={color} /> }} />
    </Tabs>
  );
}
