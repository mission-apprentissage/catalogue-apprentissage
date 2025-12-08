const { Formation } = require("../../../common/models");
const logger = require("../../../common/logger");
const { cursor } = require("../../../common/utils/cursor");
const { validateUAI } = require("../../../common/utils/uaiUtils");

const run = async () => {
  let updated = 0;

  await cursor(
    Formation.find({}),
    async ({
      _id,
      etablissement_formateur_code_commune_insee,
      code_commune_insee,
      uai_formation,
      etablissement_formateur_uai,
    }) => {
      if (
        (etablissement_formateur_code_commune_insee !== code_commune_insee &&
          uai_formation === etablissement_formateur_uai) ||
        !uai_formation ||
        !uai_formation.length ||
        !validateUAI(uai_formation)
      ) {
        await Formation.updateOne(
          { _id },
          {
            parcoursup_id: null,
          }
        );
        updated++;
      }
    }
  );

  logger.info({ type: "job" }, `Total formations nettoyées pour cause d'UAI invalide pour Parcoursup : ${updated}\n`);
};

module.exports = {
  run,
};
