export function getMotionDuration(reduceMotion: boolean, duration: number): number {
  if (reduceMotion) return 0;
  return Math.max(0, Math.round(duration));
}

export function getMotionDistance(reduceMotion: boolean, distance: number): number {
  if (reduceMotion) return 0;
  return Math.max(0, distance);
}
