const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const { isBetween } = require("../../../common/utils/dateUtils");

/**
 */
const run = async () => {
  let updated = 0;
  const next_campagne_debut = new Date("2023/08/01");
  const next_campagne_end = new Date("2024/07/31");

  console.log({ next_campagne_debut, next_campagne_end });

  await cursor(Formation.find(), async ({ _id, affelnet_id, affelnet_statut, affelnet_statut_history, date_debut }) => {
    let next_affelnet_statut;

    const in_next_campagne = date_debut?.filter((toCheck) =>
      isBetween(next_campagne_debut, new Date(toCheck), next_campagne_end)
    );
    if (affelnet_id && affelnet_statut === PARCOURSUP_STATUS.PUBLIE && in_next_campagne) {
      next_affelnet_statut = PARCOURSUP_STATUS.EN_ATTENTE;
      await Formation.updateOne(
        { _id: _id },
        {
          affelnet_statut: next_affelnet_statut,
          affelnet_published_date: null,
          affelnet_statut_history: [
            ...affelnet_statut_history,
            {
              date: new Date(),
              affelnet_statut: next_affelnet_statut,
            },
          ],
        }
      );
      updated++;
    } else if (affelnet_statut !== PARCOURSUP_STATUS.HORS_PERIMETRE) {
      next_affelnet_statut = PARCOURSUP_STATUS.HORS_PERIMETRE;
      await Formation.updateOne(
        { _id: _id },
        {
          affelnet_statut: next_affelnet_statut,
          rejection: null,
          affelnet_error: null,
          affelnet_raison_depublication: null,
          affelnet_statut_history: [
            ...affelnet_statut_history,
            {
              date: new Date(),
              affelnet_statut: next_affelnet_statut,
            },
          ],
        }
      );
      updated++;
    }

    console.log({
      _id,
      affelnet_id,
      affelnet_statut,
      date_debut,
      next_affelnet_statut,
    });
  });

  logger.info(`Total formations réinitialisées pour Parcoursup : ${updated}\n`);
};

module.exports = {
  run,
};
