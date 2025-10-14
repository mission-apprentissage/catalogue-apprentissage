const { Formation } = require("../../../common/models");
const logger = require("../../../common/logger");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const { getSessionStartDate, getSessionEndDate } = require("../../../common/utils/rulesUtils");

const run = async () => {
  let updated = 0;
  Formation.updateMany({}, { $set: { parcoursup_statut_reinitialisation: null } });

  await cursor(
    Formation.find({
      parcoursup_statut: { $nin: [PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT, PARCOURSUP_STATUS.NON_PUBLIE] },
      cle_me_remplace_par_traitee: { $ne: true },
    }),
    async ({ _id, parcoursup_id, parcoursup_statut, parcoursup_statut_history, parcoursup_perimetre, date_debut }) => {
      let next_parcoursup_statut;

      if (parcoursup_id && parcoursup_statut === PARCOURSUP_STATUS.PUBLIE && parcoursup_perimetre) {
        next_parcoursup_statut = !!date_debut.find(
          async (date) =>
            date.getTime() >= (await getSessionStartDate()).getTime() &&
            date.getTime() <= (await getSessionEndDate()).getTime()
        )
          ? PARCOURSUP_STATUS.PRET_POUR_INTEGRATION
          : PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT;

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
    }
  );

  logger.info({ type: "job" }, `Total formations réinitialisées pour Parcoursup : ${updated}\n`);
};

module.exports = {
  run,
};
