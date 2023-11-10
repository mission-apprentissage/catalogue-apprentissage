const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const { isBetween } = require("../../../common/utils/dateUtils");
const { getSessionStartDate, getSessionEndDate } = require("../../../common/utils/rulesUtils");

const run = async () => {
  let updated = 0;
  const sessionStartDate = getSessionStartDate();
  const sessionEndDate = getSessionEndDate();

  await cursor(
    Formation.find({ parcoursup_statut: { $ne: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT } }),
    async ({ _id, parcoursup_id, parcoursup_statut, parcoursup_statut_history, date_debut }) => {
      let next_parcoursup_statut;

      const in_next_session =
        date_debut?.filter((toCheck) => isBetween(sessionStartDate, new Date(toCheck), sessionEndDate))?.length > 0;

      if (parcoursup_id && parcoursup_statut === PARCOURSUP_STATUS.PUBLIE && in_next_session) {
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
        next_parcoursup_statut = PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT;
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

      // console.log({
      //   _id,
      //   parcoursup_id,
      //   parcoursup_statut,
      //   date_debut,
      //   next_parcoursup_statut,
      // });
    }
  );

  logger.info({ type: "job" }, `Total formations réinitialisées pour Parcoursup : ${updated}\n`);
};

module.exports = {
  run,
};
