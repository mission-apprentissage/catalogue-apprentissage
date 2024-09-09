const { Formation } = require("../../../common/models");
const { AFFELNET_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const logger = require("../../../common/logger");

const run = async () => {
  await cursor(
    Formation.find({
      published: true,
      affelnet_perimetre: true,
      cle_me_remplace: { $ne: null },
      "cle_me_remplace.0": { $exists: true },
      cle_me_remplace_traitee: { $ne: true },
    }),
    async (formation) => {
      logger.debug(
        { type: "job" },
        `La formation ${formation.cle_ministere_educatif} a des prédécesseurs et n'a pas été traitée, application des règles de remplacement`
      );

      const predecesseurs = await Formation.find({ cle_ministere_educatif: { $in: formation.cle_me_remplace } });

      const isOnePredecesseurPublie = !!predecesseurs.find(
        (predecesseur) => predecesseur.affelnet_statut === AFFELNET_STATUS.PUBLIE
      );

      const perviousEditedFormation = predecesseurs.find((predecesseur) => !!predecesseur?.editedFields?.uai_formation);

      const previousEditedUaiFormation = perviousEditedFormation?.editedFields?.uai_formation;
      const previousEditedUaiFormationAuthor = perviousEditedFormation?.updates_history?.find(
        (history) => history.to.uai_formation === previousEditedUaiFormation
      )?.to?.last_update_who;

      await Formation.updateOne(
        { cle_ministere_educatif: formation.cle_ministere_educatif },
        {
          $set: {
            ...(isOnePredecesseurPublie && formation.affelnet_statut !== AFFELNET_STATUS.PUBLIE
              ? { affelnet_statut: AFFELNET_STATUS.EN_ATTENTE }
              : {}),
            ...(!!previousEditedUaiFormation && !formation.editedFields?.uai_formation
              ? {
                  uai_formation: previousEditedUaiFormation,
                  editedFields: {
                    uai_formation: previousEditedUaiFormation,
                  },
                }
              : {}),
            cle_me_remplace_traitee: true,
          },
          $push: {
            updates_history: {
              from: {
                cle_me_remplace_traitee: false,
                ...(previousEditedUaiFormation && !formation.editedFields?.uai_formation
                  ? { uai_formation: formation.uai_formation }
                  : {}),
              },
              to: {
                cle_me_remplace_traitee: true,
                ...(previousEditedUaiFormation && !formation.editedFields?.uai_formation
                  ? {
                      uai_formation: previousEditedUaiFormation,
                      last_update_who: previousEditedUaiFormationAuthor,
                      last_update_automatic: true,
                    }
                  : {}),
              },
              updated_at: new Date(),
            },
          },
        }
      );

      await Formation.updateMany(
        { cle_ministere_educatif: { $in: formation.cle_me_remplace }, cle_me_remplace_par_traitee: { $ne: true } },
        {
          $set: {
            affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
            cle_me_remplace_par_traitee: true,
          },
          $push: {
            updates_history: {
              from: {
                cle_me_remplace_par_traitee: false,
              },
              to: {
                cle_me_remplace_par_traitee: true,
                last_update_automatic: true,
              },
              updated_at: new Date(),
            },
          },
        }
      );
    }
  );
};

module.exports = { run };
