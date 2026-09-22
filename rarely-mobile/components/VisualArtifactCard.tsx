import { Image, Text, View } from 'react-native';
import type { VisualArtifact } from '../lib/sponsors/types';

export function VisualArtifactCard({ artifact }: { artifact: VisualArtifact }) {
  const imageSource = artifact.imageUrl.startsWith('mock://')
    ? require('../assets/mock/perfectcorp.png')
    : { uri: artifact.imageUrl };

  return (
    <View style={{ borderRadius: 22, overflow: 'hidden', backgroundColor: '#111' }}>
      <Image source={imageSource} style={{ width: '100%', height: 360 }} />
      <View style={{ padding: 14, gap: 4 }}>
        <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800' }}>{artifact.title}</Text>
        <Text style={{ color: '#D6D6D9' }}>{artifact.engine}</Text>
        <Text style={{ color: '#AFAFB6', fontSize: 11 }}>{artifact.disclaimer}</Text>
      </View>
    </View>
  );
}
