export const buildUpdatesHistory = (origin, updates, keys, date = new Date()) => {
  const from = keys.reduce((acc, key) => {
    acc[key] = origin[key];
    return acc;
  }, {});
  return [{ from, to: { ...updates }, updated_at: date }];
};

export function sortDescending(a, b) {
  return new Date(b.updated_at) - new Date(a.updated_at);
}

export function sortAscending(a, b) {
  return new Date(a.updated_at) - new Date(b.updated_at);
}
