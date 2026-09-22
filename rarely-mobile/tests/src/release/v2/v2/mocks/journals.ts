import { createSeededFactory, range, seededDate } from './factory';

export interface MockJournal {
  id: string;
  title: string;
  body: string;
  mood: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
}

const MOODS = ['happy', 'stressed', 'creative', 'tired', 'excited', 'vibing'];
const PROMPTS = [
  'What felt lighter than expected?', 'What are you curious about?', 'What do you want to remember?',
  'What can be smaller today?', 'What did you notice on purpose?', 'What made you smile?',
];

const factory = createSeededFactory<MockJournal>('journal', (index, id) => ({
  id,
  title: `Note ${index + 1}`,
  body: `${PROMPTS[index % PROMPTS.length]}\n\nThis is deterministic mock content for development and test environments.`,
  mood: MOODS[index % MOODS.length],
  createdAt: seededDate(index),
  updatedAt: seededDate(index) + 3_600_000,
  archived: index % 11 === 0,
}));

export const MOCK_JOURNALS: MockJournal[] = range(300).map(factory.make);
