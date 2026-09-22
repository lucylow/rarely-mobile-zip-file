import type { DeepLink } from './parser';

export interface Router {
  replace(path: string): void;
  push(path: string): void;
}

export function routeDeepLink(router: Router, link: DeepLink): void {
  switch (link.kind) {
    case 'home': router.replace('/'); break;
    case 'moment': router.push(`/moment/${encodeURIComponent(link.momentId)}`); break;
    case 'journal': router.push(`/journal/${encodeURIComponent(link.journalId)}`); break;
    case 'routine': router.push(`/routine/${encodeURIComponent(link.routineId)}`); break;
    case 'circle': router.push(`/circle/${encodeURIComponent(link.circleId)}`); break;
    case 'membership': router.push('/membership'); break;
    case 'unknown': router.replace('/'); break;
  }
}
