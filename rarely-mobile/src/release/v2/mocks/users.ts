import { createSeededFactory, range, seededDate } from './factory';

export interface MockUser {
  id: string;
  displayName: string;
  handle: string;
  joinedAt: number;
  premium: boolean;
  mood: string;
}

const NAMES = ['Ari', 'Maya', 'Noor', 'Sam', 'Jo', 'Kai', 'Remy', 'Lena', 'Milo', 'Zoe', 'Ira', 'Nova'];
const MOODS = ['happy', 'stressed', 'creative', 'tired', 'excited', 'vibing'];

const factory = createSeededFactory<MockUser>('user', (index, id) => ({
  id,
  displayName: NAMES[index % NAMES.length],
  handle: `${NAMES[index % NAMES.length].toLowerCase()}_${index + 1}`,
  joinedAt: seededDate(index),
  premium: index % 5 === 0,
  mood: MOODS[index % MOODS.length],
}));

export const MOCK_USERS: MockUser[] = range(250).map(factory.make);
