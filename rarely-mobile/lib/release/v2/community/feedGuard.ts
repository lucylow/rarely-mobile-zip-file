export interface FeedItem { id: string; authorId: string; hidden?: boolean; }
export function filterBlocked(items: FeedItem[], blocked: Set<string>): FeedItem[] { return items.filter((item) => !item.hidden && !blocked.has(item.authorId)); }
