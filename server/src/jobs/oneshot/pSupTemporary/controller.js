const { ConvertedFormation } = require("../../../common/model/index");
const logger = require("../../../common/logger");

const run = async () => {
  const filter = {};

  const { nModified } = await ConvertedFormation.updateMany(
    {
      ...filter,
      parcoursup_a_charger: false,
      published: true,
      $and: [
        { cfd: { $ne: null } },
        { cfd: { $ne: "" } },
        { intitule_long: { $ne: null } },
        { intitule_long: { $ne: "" } },
        { intitule_court: { $ne: null } },
        { intitule_court: { $ne: "" } },
        {
          $or: [{ niveau: "4 (Bac...)" }, { niveau: "5 (BTS, DUT...)" }, { niveau: "6 (Licence...)" }],
        },
        {
          $or: [
            { uai_formation: { $ne: null } },
            { etablissement_formateur_uai: { $ne: null } },
            { etablissement_gestionnaire_uai: { $ne: null } },
          ],
        },
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
              $or: [
                { rncp_etablissement_formateur_habilite: true },
                { rncp_etablissement_gestionnaire_habilite: true },
              ],
            },
          ],
        },
      ],
    },
    { $set: { last_update_at: Date.now(), parcoursup_a_charger: true } }
  );
  logger.info(`${nModified} Formations updated`);
};

module.exports = { run };
