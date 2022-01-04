const toBePublishedRulesParcousup = {
  cfd_outdated: { $ne: true },
  published: true,
  etablissement_reference_catalogue_published: true,
  annee: { $in: ["1", "9", "X"] },
  etablissement_gestionnaire_catalogue_published: true, // ensure gestionnaire is Qualiopi certified
};

const toBePublishedRulesAffelnet = {
  cfd_outdated: { $ne: true },
  published: true,
  etablissement_reference_catalogue_published: true,
  annee: { $ne: "X" },
  etablissement_gestionnaire_catalogue_published: true, // ensure gestionnaire is Qualiopi certified
};

const getPublishedRules = (plateforme) => {
  switch (plateforme) {
    case "affelnet":
      return toBePublishedRulesAffelnet;

    case "parcoursup":
      return toBePublishedRulesParcousup;

    default:
      throw new Error(`Invalid plateforme : ${plateforme}`);
  }
};

module.exports = { getPublishedRules };
