import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
export function LoadingState({ label = 'Loading…' }: { label?: string }) { return <View accessibilityRole='progressbar' style={{ gap: 8 }}><ActivityIndicator /><Text>{label}</Text></View>; }
export function EmptyState({ title, detail }: { title: string; detail: string }) { return <View style={{ gap: 8 }}><Text accessibilityRole='header'>{title}</Text><Text>{detail}</Text></View>; }
