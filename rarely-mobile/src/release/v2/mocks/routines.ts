import { createSeededFactory, range } from './factory';

export interface MockRoutine {
  id: string;
  title: string;
  durationMinutes: number;
  cadence: 'daily' | 'weekly' | 'weekdays';
  accent: string;
}

const TITLES = ['Soft Focus', 'Color Play', 'The Reset', 'Five Quiet Minutes', 'One Good Line', 'Evening Collecting'];
const ACCENTS = ['coral', 'plum', 'lavender', 'blush', 'ivory'];
const factory = createSeededFactory<MockRoutine>('routine', (index, id) => ({
  id,
  title: TITLES[index % TITLES.length],
  durationMinutes: [5, 7, 10, 12][index % 4],
  cadence: ['daily', 'weekly', 'weekdays'][index % 3] as MockRoutine['cadence'],
  accent: ACCENTS[index % ACCENTS.length],
}));

export const MOCK_ROUTINES: MockRoutine[] = range(90).map(factory.make);
