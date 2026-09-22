import { createSeededFactory, range, seededDate } from './factory';

export interface MockNotification {
  id: string;
  kind: 'routine' | 'reflection' | 'membership';
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

const TITLES = ['A tiny ritual is waiting', 'A softer question for today', 'Your membership is active', 'One small creative idea'];
const factory = createSeededFactory<MockNotification>('notification', (index, id) => ({
  id,
  kind: ['routine', 'reflection', 'membership'][index % 3] as MockNotification['kind'],
  title: TITLES[index % TITLES.length],
  body: 'Open RARELY whenever you have a few minutes to yourself.',
  read: index % 3 === 0,
  createdAt: seededDate(index),
}));

export const MOCK_NOTIFICATIONS: MockNotification[] = range(180).map(factory.make);
