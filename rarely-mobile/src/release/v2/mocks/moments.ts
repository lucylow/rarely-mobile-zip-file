import { createSeededFactory, range, seededDate } from './factory';

export interface MockMoment {
  id: string;
  title: string;
  mood: string;
  minutes: number;
  category: 'journal' | 'photo' | 'music' | 'collage' | 'ritual';
  reason: string;
  createdAt: number;
}

const MOODS = ['happy', 'stressed', 'creative', 'tired', 'excited', 'vibing'];
const CATEGORIES = ['journal', 'photo', 'music', 'collage', 'ritual'] as const;
const TITLES = [
  'Notice one beautiful thing', 'Write an I-wonder line', 'Name today\'s color', 'Make a tiny collage',
  'Three songs, one feeling', 'A five-minute reset', 'Keep one sentence', 'Photograph a texture',
  'Draw a shape twice', 'Write from the senses', 'Make a soft list', 'Collect a small surprise',
];

const factory = createSeededFactory<MockMoment>('moment', (index, id) => ({
  id,
  title: TITLES[index % TITLES.length],
  mood: MOODS[index % MOODS.length],
  minutes: [3, 5, 7, 10, 12][index % 5],
  category: CATEGORIES[index % CATEGORIES.length],
  reason: ['matches your mood', 'fits a short window', 'builds on recent activity'][index % 3],
  createdAt: seededDate(index),
}));

export const MOCK_MOMENTS: MockMoment[] = range(500).map(factory.make);

export function momentsForMood(mood: string): MockMoment[] {
  return MOCK_MOMENTS.filter((moment) => moment.mood === mood).slice(0, 30);
}

export function getMoment(id: string): MockMoment | undefined {
  return MOCK_MOMENTS.find((moment) => moment.id === id);
}
