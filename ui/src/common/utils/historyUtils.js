export const buildUpdatesHistory = (origin, updates, keys) => {
  const from = keys.reduce((acc, key) => {
    acc[key] = origin[key];
    return acc;
  }, {});
  return [...(origin.updates_history ?? []), { from, to: { ...updates }, updated_at: new Date() }];
};

export function sortDescending(a, b) {
  return new Date(b.updated_at) - new Date(a.updated_at);
}

export function sortAscending(a, b) {
  return new Date(a.updated_at) - new Date(b.updated_at);
}
