const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const { isBetween } = require("../../../common/utils/dateUtils");
const { getSessionStartDate, getSessionEndDate } = require("../../../common/utils/rulesUtils");
const { isValideUAI } = require("@mission-apprentissage/tco-service-node");

/**
 * TODO : Voir s'il n'est pas plutôt possible de tout repasser à hors périmètre (sans mise à jour de l'historique) et se baser sur la présence ou non d'un parcoursup_id dans les scripts de périmètre pour passage automatique à "en attente".
 */
const run = async () => {
  let updated = 0;
  const sessionStartDate = getSessionStartDate();
  const sessionEndDate = getSessionEndDate();

  await cursor(
    Formation.find({ parcoursup_statut: { $ne: PARCOURSUP_STATUS.HORS_PERIMETRE } }),
    async ({
      _id,
      parcoursup_id,
      parcoursup_statut,
      parcoursup_statut_history,
      date_debut,
      etablissement_formateur_code_commune_insee,
      code_commune_insee,
      uai_formation,
      etablissement_formateur_uai,
    }) => {
      let next_parcoursup_statut;

      const in_next_session =
        date_debut?.filter((toCheck) => isBetween(sessionStartDate, new Date(toCheck), sessionEndDate))?.length > 0;

      if (
        parcoursup_id &&
        parcoursup_statut === PARCOURSUP_STATUS.PUBLIE &&
        in_next_session &&
        !(
          (etablissement_formateur_code_commune_insee !== code_commune_insee &&
            uai_formation === etablissement_formateur_uai) ||
          !uai_formation ||
          !uai_formation.length ||
          !isValideUAI(uai_formation)
        )
      ) {
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
            parcoursup_id: null,
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
