export function isImageMime(value: string | undefined): boolean { return !!value && /^image\/(jpeg|png|heic|webp)$/i.test(value); }
