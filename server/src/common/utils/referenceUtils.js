const toBePublishedRules = {
  cfd_outdated: { $ne: true },
  published: true,
  etablissement_reference_catalogue_published: true,
};

module.exports = { toBePublishedRules };
