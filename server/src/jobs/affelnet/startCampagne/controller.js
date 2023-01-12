const { Formation, AffelnetFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { AFFELNET_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");

/**
 * Permet de réinitialiser les statuts de publication Affelnet en début de campagne.
 * Ici seul les formations en attente de publication sont passées à hors périmètre, les
 * autres statuts sont gérés par le processus classique du script d'application des règles
 * de périmètre.
 */
const run = async () => {
  let updated = 0;

  // Réinitialisation des formations Affelnet afin de ne pas retrouver de match
  await AffelnetFormation.deleteMany({});

  // Mise à jour des formations
  await cursor(
    Formation.find({ affelnet_statut: { $ne: AFFELNET_STATUS.HORS_PERIMETRE } }),
    async ({ _id, affelnet_statut }) => {
      let next_affelnet_statut;

      if (![AFFELNET_STATUS.EN_ATTENTE].includes(affelnet_statut)) {
        next_affelnet_statut = AFFELNET_STATUS.HORS_PERIMETRE;
        await Formation.updateOne(
          { _id: _id },
          {
            affelnet_statut: next_affelnet_statut,
            affelnet_published_date: null,
          }
        );
        updated++;
      }
    }
  );

  logger.info(`Total formations réinitialisées pour Affelnet : ${updated}\n`);
};

module.exports = {
  run,
};
