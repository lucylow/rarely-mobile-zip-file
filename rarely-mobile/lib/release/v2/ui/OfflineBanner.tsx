import React from 'react';
import { Text, View } from 'react-native';
export function OfflineBanner({ visible }: { visible: boolean }) { if (!visible) return null; return <View accessibilityRole='alert' style={{ padding: 8 }}><Text>You’re offline. RARELY is showing what is saved on this device.</Text></View>; }
