import React from 'react';
import { Text, View } from 'react-native';
import type { DeletionStep } from '../data/deletionPlan';

export function DeletionProgress({ steps }: { steps: DeletionStep[] }) {
  const completed = steps.filter((step) => step.completed).length;
  return (
    <View style={{ gap: 8, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Deleting your RARELY data</Text>
      <Text>{completed} of {steps.length} cleanup steps complete.</Text>
      {steps.map((step) => (
        <Text key={step.resource} accessibilityLabel={`${step.resource}: ${step.completed ? 'complete' : 'pending'}`}>
          {step.completed ? '✓' : '○'} {step.detail}
        </Text>
      ))}
    </View>
  );
}
