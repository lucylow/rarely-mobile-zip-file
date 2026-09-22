import React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface ErrorRecoveryViewProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function ErrorRecoveryView({ title = 'Something went sideways', message, retryLabel = 'Try again', onRetry, secondaryLabel, onSecondary }: ErrorRecoveryViewProps) {
  return (
    <View accessibilityRole='alert' style={{ gap: 12, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>{title}</Text>
      <Text style={{ fontSize: 16, lineHeight: 22 }}>{message}</Text>
      {onRetry ? <Pressable accessibilityRole='button' onPress={onRetry}><Text>{retryLabel}</Text></Pressable> : null}
      {onSecondary ? <Pressable accessibilityRole='button' onPress={onSecondary}><Text>{secondaryLabel ?? 'Go back'}</Text></Pressable> : null}
    </View>
  );
}
