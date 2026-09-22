import type { AiResponse } from './response';

const FALLBACKS: Record<AiResponse['mode'], AiResponse[]> = {
  spark: [
    { title: 'Tiny idea', body: 'Write one sentence beginning with “I wonder…” and stop there.', suggestions: ['Use a color you noticed today.', 'Name one thing you want to remember.'], mode: 'spark' },
    { title: 'Make a contrast', body: 'Describe something ordinary in an unexpectedly dramatic way.', suggestions: ['A coffee mug', 'A sidewalk', 'A quiet room'], mode: 'spark' },
  ],
  reflect: [
    { title: 'Keep what helped', body: 'Name one small thing that made today easier than it could have been.', suggestions: ['A person', 'A place', 'A choice'], mode: 'reflect' },
    { title: 'A softer ending', body: 'Write three words you want to carry into tomorrow.', suggestions: ['steady', 'curious', 'enough'], mode: 'reflect' },
  ],
  play: [
    { title: 'Color hunt', body: 'Find the most interesting color near you and give it a new name.', suggestions: ['storm glass', 'apricot dusk', 'blue hour'], mode: 'play' },
    { title: 'Odd pairing', body: 'Pick two unrelated objects and invent the reason they belong together.', suggestions: ['keys + leaf', 'shoe + postcard'], mode: 'play' },
  ],
};

export function deterministicFallback(mode: AiResponse['mode'], seed = 0): AiResponse {
  const list = FALLBACKS[mode];
  return list[Math.abs(seed) % list.length];
}
