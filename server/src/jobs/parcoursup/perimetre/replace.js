const { Formation, Config } = require("../../../common/models");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const logger = require("../../../common/logger");

const run = async () => {
  const config = await Config.findOne();

  await cursor(
    Formation.find({
      published: true,
      parcoursup_perimetre: true,
      cle_me_remplace: { $ne: null },
      "cle_me_remplace.0": { $exists: true },
      "cle_me_remplace.1": { $exists: false },
      cle_me_remplace_traitee: { $ne: true },
    }),
    async (formation) => {
      logger.debug(
        { type: "job" },
        `La formation ${formation.cle_ministere_educatif} a des prédécesseurs et n'a pas été traitée, application des règles de remplacement`
      );

      const predecesseurs = await Formation.find({ cle_ministere_educatif: { $in: formation.cle_me_remplace } });

      const isOnePredecesseurPublie = !!predecesseurs.find(
        (predecesseur) => predecesseur.parcoursup_statut === PARCOURSUP_STATUS.PUBLIE
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
            ...(isOnePredecesseurPublie
              ? {
                  parcoursup_statut: config?.parcoursup_export
                    ? PARCOURSUP_STATUS.PRET_POUR_INTEGRATION
                    : PARCOURSUP_STATUS.PUBLIE,
                }
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
        {
          parcoursup_perimetre: true,
          cle_ministere_educatif: { $in: formation.cle_me_remplace },
          $or: [
            { cle_me_remplace_par_traitee: { $ne: true } },
            { parcoursup_statut: { $ne: PARCOURSUP_STATUS.NON_PUBLIE } },
          ],
        },
        {
          $set: {
            parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
            parcoursup_raison_depublication: "Non publication automatique (offre remplacée par une plus récente)",
            cle_me_remplace_par_traitee: true,
            parcoursup_id: null,
          },
          $push: {
            updates_history: {
              from: {
                cle_me_remplace_par_traitee: false,
              },
              to: {
                cle_me_remplace_par_traitee: true,
                parcoursup_raison_depublication: "Non publication automatique (offre remplacée par une plus récente)",
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

/**
 * Requête pour forcer les non publications après réinitialisation de campagne si jamais celles-ci n'étaient pas persistées malgré le traitement des 'annule et remplace'
 *
db.getCollection("formations").aggregate([
    {
        $match: {
            published: true,
            parcoursup_perimetre: true,
            cle_me_remplace: { $ne: null },
            "cle_me_remplace.0": { $exists: true },
            "cle_me_remplace.1": { $exists: false },
            cle_me_remplace_traitee: { $eq: true },
        }
    },
    {
        $lookup: {
            from: "formations",
            localField: "cle_me_remplace",
            foreignField: "cle_ministere_educatif",
            as: "formations_remplacees"
        }
    },
    {
        $unwind: "$formations_remplacees"
    },
    {
        $replaceRoot: {
            newRoot: "$formations_remplacees"
        }
    },
    {
        $match: { parcoursup_perimetre: true }
    },
    {
        $project: {
            _id: 1,
            cle_ministere_educatif: 1,
            cle_me_remplace_par: 1,
            cle_me_remplace_par_traitee: 1,
            parcoursup_statut: 1
        }
    },
    {
        $merge : {
            into: "formations",
            on: "_id",
            whenMatched: [
                { $set: { parcoursup_statut: "non publié" } }
            ],
            whenNotMatched: "discard"
        }
    }
])
 */

module.exports = { run };
