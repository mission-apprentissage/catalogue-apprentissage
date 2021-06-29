const toBePublishedRules = {
  cfd: { $nin: [null, ""] },
  intitule_long: { $nin: [null, ""] },
  intitule_court: { $nin: [null, ""] },
  cfd_outdated: { $ne: true },
  published: true,
  etablissement_reference_catalogue_published: true,
};

module.exports = { toBePublishedRules };
