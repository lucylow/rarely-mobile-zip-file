export const MOCK_USERS = Array.from({ length: 80 }, (_, index) => ({
  id: `user-${String(index + 1).padStart(3, "0")}`,
  displayName: `Rarer ${String.fromCharCode(65 + (index % 26))}${index + 1}`,
  interests: ["journaling", "creativity", "music"].slice(0, 1 + (index % 3)),
  joinedAt: `2026-08-${String((index % 28) + 1).padStart(2, "0")}T12:00:00.000Z`,
  notificationOptIn: index % 4 !== 0,
}));
