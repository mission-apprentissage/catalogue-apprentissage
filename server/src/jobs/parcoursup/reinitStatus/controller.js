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

  await cursor(
    Formation.find(),
    async ({ _id, parcoursup_id, parcoursup_statut, parcoursup_statut_history, date_debut }) => {
      let next_parcoursup_statut;

      const in_next_campagne = date_debut?.filter((toCheck) =>
        isBetween(next_campagne_debut, new Date(toCheck), next_campagne_end)
      );
      if (parcoursup_id && parcoursup_statut === PARCOURSUP_STATUS.PUBLIE && in_next_campagne) {
        next_parcoursup_statut = PARCOURSUP_STATUS.EN_ATTENTE;
        await Formation.updateOne(
          { _id: _id },
          {
            parcoursup_statut: next_parcoursup_statut,
            parcoursup_statut_history: [
              ...parcoursup_statut_history,
              {
                date: new Date(),
                parcoursup_statut: next_parcoursup_statut,
              },
            ],
          }
        );
        updated++;
      } else if (parcoursup_statut !== PARCOURSUP_STATUS.HORS_PERIMETRE) {
        next_parcoursup_statut = PARCOURSUP_STATUS.HORS_PERIMETRE;
        await Formation.updateOne(
          { _id: _id },
          {
            parcoursup_statut: next_parcoursup_statut,
            parcoursup_statut_history: [
              ...parcoursup_statut_history,
              {
                date: new Date(),
                parcoursup_statut: next_parcoursup_statut,
              },
            ],
          }
        );
        updated++;
      }

      console.log({
        _id,
        parcoursup_id,
        parcoursup_statut,
        date_debut,
        next_parcoursup_statut,
      });
    }
  );

  logger.info(`Total formations réinitialisées pour Parcoursup : ${updated}\n`);
};

module.exports = {
  run,
};
