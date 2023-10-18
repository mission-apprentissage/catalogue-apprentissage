const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { cursor } = require("../../../common/utils/cursor");
const { isValideUAI } = require("@mission-apprentissage/tco-service-node");

/**
 * TODO : Voir s'il n'est pas plutôt possible de tout repasser à hors périmètre (sans mise à jour de l'historique) et se baser sur la présence ou non d'un parcoursup_id dans les scripts de périmètre pour passage automatique à "en attente".
 */
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
        !isValideUAI(uai_formation)
      ) {
        await Formation.updateOne(
          { _id: _id },
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
