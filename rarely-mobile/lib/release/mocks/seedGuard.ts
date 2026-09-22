export function canSeedMocks(input: { dev: boolean; explicit: boolean; production: boolean }): boolean { return input.dev && input.explicit && !input.production; }
