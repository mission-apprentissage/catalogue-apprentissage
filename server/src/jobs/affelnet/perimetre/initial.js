const logger = require("../../../common/logger");
const { Formation, ReglePerimetre } = require("../../../common/models");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getQueryFromRule, getSessionDateRules } = require("../../../common/utils/rulesUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");

const run = async () => {
  const filterSessionDate = await getSessionDateRules();

  const filterReglement = {
    $and: [
      {
        published: true,
        $or: [{ catalogue_published: true }, { force_published: true }],
      },
      {
        $or: [
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP", null],
            },
            rncp_code: { $exists: true, $ne: null },
            "rncp_details.rncp_outdated": false,
          },
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP", null],
            },
            rncp_code: { $eq: null },
            cfd_outdated: false,
          },
          {
            "rncp_details.code_type_certif": {
              $nin: ["Titre", "TP", null],
            },
            cfd_outdated: false,
          },
        ],
      },
    ],
  };

  /** 1. On réinitialise les formations "à publier ..." à "non publiable en l'état" pour permettre le recalcule du statut initial */
  logger.debug({ type: "job" }, "Etape 1.");
  await Formation.updateMany(
    {
      affelnet_statut_initial: { $ne: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT },
    },

    { $set: { affelnet_statut_initial: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  /** 2. On applique les règles de périmètres */
  logger.debug({ type: "job" }, "Etape 2.");

  const filterStatus = {
    affelnet_statut: {
      $in: [
        AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
        AFFELNET_STATUS.A_DEFINIR,
        AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        AFFELNET_STATUS.A_PUBLIER,
        AFFELNET_STATUS.PRET_POUR_INTEGRATION,
      ],
    },
  };

  // Les règles pour lesquelles on ne procède pas à des publications
  const statutsPublicationInterdite = [AFFELNET_STATUS.A_DEFINIR];

  const reglesPublicationInterdite = await ReglePerimetre.find({
    plateforme: "affelnet",
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
        [
          {
            $set: {
              affelnet_statut_initial: rule.statut,
            },
          },
        ]
      );
    }));

  // Les règles pour lesquelles on ne procède pas à des publications automatiques, mais qui peuvent être publiées par les instructeurs
  const statutsPublicationManuelle = [AFFELNET_STATUS.A_PUBLIER_VALIDATION];

  const reglesPublicationManuelle = await ReglePerimetre.find({
    plateforme: "affelnet",
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
        [
          {
            $set: {
              affelnet_statut_initial: rule.statut,
            },
          },
        ]
      );
    }));

  // Les règles pour lesquelles on procède à des publications automatiques et qui peuvent être publiées par les instructeurs
  const statusPublicationAutomatique = [AFFELNET_STATUS.A_PUBLIER];

  const reglesPublicationAutomatique = await ReglePerimetre.find({
    plateforme: "affelnet",
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
        [
          {
            $set: {
              affelnet_statut_initial: rule.statut,
            },
          },
        ]
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
        [
          {
            $set: {
              affelnet_statut_initial: status,
            },
          },
        ]
      );
    });
  });
};

module.exports = { run };
