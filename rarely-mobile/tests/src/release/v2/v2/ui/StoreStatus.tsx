import React from 'react';
import { Text, View } from 'react-native';
export function StoreStatus({ label }: { label: string }) { return <View style={{ gap: 4 }}><Text accessibilityRole='header'>Membership</Text><Text>{label}</Text></View>; }
