const logger = require("../../../common/logger");
const { Formation, ReglePerimetre } = require("../../../common/models");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getQueryFromRule, getSessionDateRules, notOutdatedRule } = require("../../../common/utils/rulesUtils");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const excludedRNCPs = [];

const run = async () => {
  const filterSessionDate = await getSessionDateRules();

  const filterReglement = {
    $and: [
      {
        published: true,
        $or: [{ catalogue_published: true }, { force_published: true }],
        rncp_code: {
          $nin: excludedRNCPs,
        },
      },
      notOutdatedRule,
    ],
  };

  /** 1. On réinitialise les formations "à publier ..." à "non publiable en l'état" pour permettre le recalcule du statut initial */
  logger.info({ type: "job" }, "Etape 1.");
  await Formation.updateMany(
    {
      parcoursup_statut_initial: { $ne: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT },
    },
    { $set: { parcoursup_statut_initial: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  /** 2. On applique les règles de périmètres */
  logger.info({ type: "job" }, "Etape 2.");

  const filterStatus = {
    // parcoursup_statut_initial: {
    //   $in: [
    //     PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    //     PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
    //     PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    //     PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    //     PARCOURSUP_STATUS.A_PUBLIER,
    //     PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
    //   ],
    // },
  };

  // Les règles pour lesquelles on ne procède pas à des publications
  const statutsPublicationInterdite = [];

  const reglesPublicationInterdite = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: {
      $in: statutsPublicationInterdite,
    },
    is_deleted: { $ne: true },
  }).lean();

  reglesPublicationInterdite.length > 0 &&
    (await asyncForEach(reglesPublicationInterdite, async (rule) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,
          ...filterStatus,

          ...getQueryFromRule(rule, true),
        },
        {
          $set: {
            parcoursup_statut_initial: rule.statut,
          },
        }
      );
    }));

  // Les règles pour lesquelles on ne procède pas à des publications automatiques, mais qui peuvent être publiées par les instructeurs
  const statutsPublicationManuelle = [
    PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
    PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  ];

  const reglesPublicationManuelle = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: {
      $in: statutsPublicationManuelle,
    },
    is_deleted: { $ne: true },
  }).lean();

  reglesPublicationManuelle.length > 0 &&
    (await asyncForEach(reglesPublicationManuelle, async (rule) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,
          ...filterStatus,

          ...getQueryFromRule(rule, true),
        },
        {
          $set: {
            parcoursup_statut_initial: rule.statut,
          },
        }
      );
    }));

  // Les règles pour lesquelles on procède à des publications automatiques et qui peuvent être publiées par les instructeurs  const statusPublicationAutomatique = [AFFELNET_STATUS.A_PUBLIER];
  const statusPublicationAutomatique = [PARCOURSUP_STATUS.A_PUBLIER];

  const reglesPublicationAutomatique = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: {
      $in: statusPublicationAutomatique,
    },
    is_deleted: { $ne: true },
  }).lean();

  reglesPublicationAutomatique.length > 0 &&
    (await asyncForEach(reglesPublicationAutomatique, async (rule) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,
          ...filterStatus,

          ...getQueryFromRule(rule, true),
        },
        {
          $set: {
            parcoursup_statut_initial: rule.statut,
          },
        }
      );
    }));

  // Les règles des académies
  const academieRules = [
    ...reglesPublicationInterdite,
    // ...reglesPublicationManuelle,
    // ...reglesPublicationAutomatique,
  ].filter(({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0);

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,
          ...filterStatus,

          num_academie,
          ...getQueryFromRule(rule, true),
        },
        {
          $set: {
            parcoursup_statut_initial: status,
          },
        }
      );
    });
  });
};

module.exports = { run };
