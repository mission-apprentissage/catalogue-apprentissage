const toBePublishedRules = {
  cfd_outdated: { $ne: true },
  published: true,
  etablissement_reference_catalogue_published: true,
  annee: { $ne: "X" }, // TODO check once rco deliver the new JSON stream
};

module.exports = { toBePublishedRules };
