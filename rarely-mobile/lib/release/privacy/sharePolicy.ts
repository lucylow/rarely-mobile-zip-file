export function canSharePrivateJournal(input: { isPrivate: boolean; userConfirmed: boolean }): boolean { return !input.isPrivate || input.userConfirmed; }
