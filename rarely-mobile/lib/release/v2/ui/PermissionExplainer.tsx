import React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface PermissionExplainerProps {
  title: string;
  detail: string;
  onContinue: () => void;
  onNotNow: () => void;
}

export function PermissionExplainer({ title, detail, onContinue, onNotNow }: PermissionExplainerProps) {
  return (
    <View style={{ gap: 12, padding: 20 }}>
      <Text accessibilityRole='header' style={{ fontSize: 21, fontWeight: '700' }}>{title}</Text>
      <Text style={{ lineHeight: 21 }}>{detail}</Text>
      <Pressable accessibilityRole='button' onPress={onContinue}><Text>Continue</Text></Pressable>
      <Pressable accessibilityRole='button' onPress={onNotNow}><Text>Not now</Text></Pressable>
    </View>
  );
}
