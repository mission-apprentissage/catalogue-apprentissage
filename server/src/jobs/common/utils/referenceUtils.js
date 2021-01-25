const toBePublishedRules = [
  { cfd: { $ne: null } },
  { cfd: { $ne: "" } },
  { intitule_long: { $ne: null } },
  { intitule_long: { $ne: "" } },
  { intitule_court: { $ne: null } },
  { intitule_court: { $ne: "" } },
  {
    $or: [
      {
        $or: [
          { etablissement_formateur_conventionne: "OUI" },
          {
            etablissement_reference_declare_prefecture: "OUI",
            etablissement_reference_datadock: "datadocké",
          },
        ],
      },
      {
        rncp_eligible_apprentissage: true,
        $or: [{ rncp_etablissement_formateur_habilite: true }, { rncp_etablissement_gestionnaire_habilite: true }],
      },
    ],
  },
];

module.exports = { toBePublishedRules };
