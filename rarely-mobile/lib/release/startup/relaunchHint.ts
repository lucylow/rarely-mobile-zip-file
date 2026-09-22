export function relaunchHint(code: string): string { return code === "STORAGE_MALFORMED" ? "Restarting the app after repair is usually enough." : "Try reopening the app."; }
