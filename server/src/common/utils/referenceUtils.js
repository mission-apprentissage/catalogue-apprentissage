const toBePublishedRules = {
  cfd_outdated: { $ne: true },
  published: true,
  etablissement_reference_catalogue_published: true,
  annee: { $ne: "X" },
};

module.exports = { toBePublishedRules };
