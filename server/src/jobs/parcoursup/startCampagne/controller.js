const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const { isBetween } = require("../../../common/utils/dateUtils");
const { getCampagneStartDate, getCampagneEndDate } = require("../../../common/utils/rulesUtils");

/**
 * TODO : Voir s'il n'est pas plutôt possible de tout repasser à hors périmètre (sans mise à jour de l'historique) et se baser sur la présence ou non d'un parcoursup_id dans les scripts de périmètre pour passage automatique à "en attente".
 */
const run = async () => {
  let updated = 0;
  const next_campagne_debut = getCampagneStartDate();
  const next_campagne_end = getCampagneEndDate();

  await cursor(
    Formation.find({ parcoursup_statut: { $ne: PARCOURSUP_STATUS.HORS_PERIMETRE } }),
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
            parcoursup_published_date: null,
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
      } else {
        next_parcoursup_statut = PARCOURSUP_STATUS.HORS_PERIMETRE;
        await Formation.updateOne(
          { _id: _id },
          {
            parcoursup_statut: next_parcoursup_statut,
            rejection: null,
            parcoursup_error: null,
            parcoursup_raison_depublication: null,
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
