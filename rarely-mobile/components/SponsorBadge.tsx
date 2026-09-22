import { Text, View } from 'react-native';

export function SponsorBadge({ label }: { label: string }) {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#D8D8DE', alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>{label}</Text>
    </View>
  );
}
