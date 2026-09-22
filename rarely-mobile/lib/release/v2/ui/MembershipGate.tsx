import React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface MembershipGateProps {
  locked: boolean;
  feature: string;
  onUpgrade: () => void;
  onRestore: () => void;
}

export function MembershipGate({ locked, feature, onUpgrade, onRestore }: MembershipGateProps) {
  if (!locked) return null;
  return (
    <View style={{ gap: 10, padding: 16 }} accessibilityLabel={`${feature} requires RARELY Premium`}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>More room for {feature}</Text>
      <Text>Premium unlocks this feature. Purchases are handled through Apple.</Text>
      <Pressable accessibilityRole='button' onPress={onUpgrade}><Text>See membership</Text></Pressable>
      <Pressable accessibilityRole='button' onPress={onRestore}><Text>Restore Purchases</Text></Pressable>
    </View>
  );
}
