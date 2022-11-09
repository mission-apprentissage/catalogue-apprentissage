const { DateTime } = require("luxon");

export const buildUpdatesHistory = (origin, updates, keys) => {
  const from = keys.reduce((acc, key) => {
    acc[key] = origin[key];
    return acc;
  }, {});
  return [...(origin.updates_history ?? []), { from, to: { ...updates }, updated_at: Date.now() }];
};

export function sortDescending(a, b) {
  return DateTime.fromISO(b.updated_at) - DateTime.fromISO(a.updated_at);
}

export function sortAscending(a, b) {
  return DateTime.fromISO(a.updated_at) - DateTime.fromISO(b.updated_at);
}
