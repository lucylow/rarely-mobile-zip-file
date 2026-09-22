import { createSeededFactory, range, seededDate } from './factory';

export interface MockPost {
  id: string;
  circleId: string;
  authorId: string;
  body: string;
  likes: number;
  createdAt: number;
  reported: boolean;
}

const BODY = [
  'I noticed the sky had three different blues today.',
  'Tiny win: I wrote one sentence and left it there.',
  'Today\'s ritual was five minutes and exactly enough.',
  'Sharing a color that made the afternoon feel softer.',
  'A reminder that unfinished can still be meaningful.',
];
const factory = createSeededFactory<MockPost>('post', (index, id) => ({
  id,
  circleId: `circle-${String((index % 40) + 1).padStart(4, '0')}`,
  authorId: `user-${String((index % 100) + 1).padStart(4, '0')}`,
  body: BODY[index % BODY.length],
  likes: (index * 13) % 130,
  createdAt: seededDate(index),
  reported: index % 97 === 0,
}));

export const MOCK_POSTS: MockPost[] = range(600).map(factory.make);
