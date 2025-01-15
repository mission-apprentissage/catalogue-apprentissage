const logger = require("../../../common/logger");
const { Formation, ReglePerimetre } = require("../../../common/models");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const {
  getQueryFromRule,
  getSessionStartDate,
  getSessionEndDate,
  getSessionDateRules,
} = require("../../../common/utils/rulesUtils");
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

  /** 2. On applique les règles de périmètres pour statut "à publier avec action attendue" uniquement sur les formations "non publiable en l'état" */
  logger.debug({ type: "job" }, "Etape 2.");

  const aPublierSoumisAValidationRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    is_deleted: { $ne: true },
  }).lean();

  const filterAPublierSoumisAValidation = {
    affelnet_statut_initial: {
      $in: [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT, AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER],
    },
  };

  if (aPublierSoumisAValidationRules.length > 0) {
    await Formation.updateMany(
      {
        ...filterReglement,
        ...filterSessionDate,
        ...filterAPublierSoumisAValidation,

        $or: aPublierSoumisAValidationRules.map((rule) => getQueryFromRule(rule, true)),
      },
      [
        {
          $set: {
            affelnet_statut_initial: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
          },
        },
      ]
    );
  }

  /** 3. On applique les règles de périmètre pour statut "à publier" pour les formations répondant aux règles de publication sur Parcoursup. */
  logger.debug({ type: "job" }, "Etape 3.");

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: AFFELNET_STATUS.A_PUBLIER,
    is_deleted: { $ne: true },
  }).lean();

  const filterAPublier = {
    affelnet_statut_initial: {
      $in: [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT, AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER],
    },
  };

  if (aPublierRules.length > 0) {
    await Formation.updateMany(
      {
        ...filterReglement,
        ...filterSessionDate,
        ...filterAPublier,
        $or: aPublierRules.map((rule) => getQueryFromRule(rule, true)),
      },
      [
        {
          $set: {
            affelnet_statut_initial: AFFELNET_STATUS.A_PUBLIER,
          },
        },
      ]
    );
  }

  /** 4. On applique les règles des académies */
  logger.debug({ type: "job" }, "Etape 4.");

  const academieRules = [...aPublierSoumisAValidationRules, ...aPublierRules].filter(
    ({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0
  );

  const filterAcademie = {
    affelnet_statut: {
      $in: [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT, AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER],
    },
  };

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,
          ...filterAcademie,

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
