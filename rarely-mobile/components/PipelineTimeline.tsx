import { Text, View } from 'react-native';

type Step = { label: string; sponsor: string; done: boolean };

export function PipelineTimeline({ steps }: { steps: Step[] }) {
  return (
    <View style={{ gap: 10 }}>
      {steps.map((step, index) => (
        <View key={step.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: step.done ? '#1F7A4D' : '#D8D8DE', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '800', color: step.done ? '#1F7A4D' : '#8C8C95' }}>{index + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800' }}>{step.label}</Text>
            <Text style={{ fontSize: 12, color: '#74747C' }}>{step.sponsor}</Text>
          </View>
          <Text>{step.done ? '✓' : '○'}</Text>
        </View>
      ))}
    </View>
  );
}
