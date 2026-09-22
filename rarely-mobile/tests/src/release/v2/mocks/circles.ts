import { createSeededFactory, range } from './factory';

export interface MockCircle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  mood: string;
  moderated: boolean;
}

const NAMES = [
  'Make Room for Ideas', 'Soft Confidence', 'The Listening Room', 'Tiny Sketch Club',
  'Evening Pages', 'Color Collectors', 'Sunday Reset', 'Curious Minds',
];
const factory = createSeededFactory<MockCircle>('circle', (index, id) => ({
  id,
  name: NAMES[index % NAMES.length],
  description: 'A calm circle for small acts of creativity and reflection.',
  memberCount: 4 + (index * 7) % 240,
  mood: ['creative', 'vibing', 'happy', 'reflective'][index % 4],
  moderated: true,
}));

export const MOCK_CIRCLES: MockCircle[] = range(120).map(factory.make);
