export interface AiResponse {
  title: string;
  body: string;
  suggestions: string[];
  mode: 'spark' | 'reflect' | 'play';
}

export function parseAiResponse(raw: unknown): AiResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.title !== 'string' || typeof candidate.body !== 'string' || !Array.isArray(candidate.suggestions)) return null;
  const suggestions = candidate.suggestions.filter((item): item is string => typeof item === 'string').slice(0, 5).map((item) => item.slice(0, 180));
  if (!['spark', 'reflect', 'play'].includes(String(candidate.mode))) return null;
  return {
    title: candidate.title.slice(0, 120),
    body: candidate.body.slice(0, 1_500),
    suggestions,
    mode: candidate.mode as AiResponse['mode'],
  };
}
