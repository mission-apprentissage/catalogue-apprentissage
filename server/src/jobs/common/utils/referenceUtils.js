const toBePublishedRules = [
  { cfd: { $ne: null } },
  { cfd: { $ne: "" } },
  { intitule_long: { $ne: null } },
  { intitule_long: { $ne: "" } },
  { intitule_court: { $ne: null } },
  { intitule_court: { $ne: "" } },
  { cfd_outdated: { $ne: true } },
  { published: true },
  { etablissement_reference_catalogue_published: true },
];

module.exports = { toBePublishedRules };
