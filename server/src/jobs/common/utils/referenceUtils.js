const toBePublishedRules = [
  { cfd: { $ne: null } },
  { cfd: { $ne: "" } },
  { intitule_long: { $ne: null } },
  { intitule_long: { $ne: "" } },
  { intitule_court: { $ne: null } },
  { intitule_court: { $ne: "" } },
];

module.exports = { toBePublishedRules };
