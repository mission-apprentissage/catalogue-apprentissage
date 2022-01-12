export const buildUpdatesHistory = (origin, updates, keys) => {
  const from = keys.reduce((acc, key) => {
    acc[key] = origin[key];
    return acc;
  }, {});
  return [...(origin.updates_history ?? []), { from, to: { ...updates }, updated_at: Date.now() }];
};
