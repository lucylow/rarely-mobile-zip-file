import { Text, View } from 'react-native';
import { SponsorBadge } from './SponsorBadge';

export function SponsorStatusCard({ name, role, badge, status = 'READY' }: { name: string; role: string; badge: string; status?: string }) {
  return (
    <View style={{ padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E5E5EA', backgroundColor: '#FFF', gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '800' }}>{name}</Text>
        <SponsorBadge label={badge} />
      </View>
      <Text style={{ color: '#62626A' }}>{role}</Text>
      <Text style={{ color: '#2D7A48', fontWeight: '700' }}>{status}</Text>
    </View>
  );
}
