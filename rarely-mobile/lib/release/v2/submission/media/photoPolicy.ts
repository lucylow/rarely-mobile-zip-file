export type PhotoCandidate = { uri: string; width: number; height: number; bytes: number; mime: string; localOnly: boolean };
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export function validatePhoto(photo: PhotoCandidate): string[] {
  const errors: string[] = [];
  if (!photo.uri.trim()) errors.push('uri-required');
  if (photo.width < 1 || photo.height < 1) errors.push('dimensions-invalid');
  if (photo.bytes > MAX_IMAGE_BYTES) errors.push('too-large');
  if (!['image/jpeg','image/png','image/heic','image/webp'].includes(photo.mime)) errors.push('mime-not-supported');
  return errors;
}
export function shouldUpload(photo: PhotoCandidate, consent: boolean): boolean { return consent && !photo.localOnly && validatePhoto(photo).length === 0; }
