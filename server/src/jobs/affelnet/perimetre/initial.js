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
  const sessionStartDate = await getSessionStartDate();
  const sessionEndDate = await getSessionEndDate();
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

  const campagneCount = await Formation.countDocuments(filterSessionDate);

  logger.debug({ type: "job" }, `${campagneCount} formations possèdent des dates de début pour la campagne en cours.`);

  /** 0. On initialise affelnet_id à null si l'information n'existe pas sur la formation */
  logger.debug({ type: "job" }, "Etape 0.");
  await Formation.updateMany({ affelnet_id: { $exists: false } }, { $set: { affelnet_id: null } });

  /** 1. Application de la réglementation : réinitialisation des étiquettes pour les formations qui sortent du périmètre quelque soit le statut (sauf publié pour le moment) */
  logger.debug({ type: "job" }, "Etape 1.");
  await Formation.updateMany(
    {
      affelnet_statut_initial: { $ne: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT },
      $or: [
        // Plus dans le flux
        { published: false },
        // Plus dans le catalogue général
        { catalogue_published: false, forced_published: { $ne: true } },
        // Diplôme périmé
        {
          "rncp_details.code_type_certif": {
            $in: ["Titre", "TP", null],
          },
          rncp_code: { $exists: true, $ne: null },
          "rncp_details.rncp_outdated": true,
        },
        {
          "rncp_details.code_type_certif": {
            $in: ["Titre", "TP", null],
          },
          rncp_code: { $eq: null },
          cfd_outdated: true,
        },
        {
          "rncp_details.code_type_certif": {
            $nin: ["Titre", "TP", null],
          },
          cfd_outdated: true,
        },
        // Date de début hors campagne en cours.
        { date_debut: { $not: { $gte: sessionStartDate, $lt: sessionEndDate } } },
        // Initialisation du statut si non existant
        { affelnet_statut_initial: null },
      ],
    },

    { $set: { affelnet_statut_initial: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  // set "à publier (soumis à validation)" for trainings matching affelnet eligibility rules
  // reset "à publier" & "à publier (soumis à validation)"
  logger.debug({ type: "job" }, "Etape 2.");
  await Formation.updateMany(
    {
      affelnet_statut_initial: { $in: [AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER] },
    },
    { $set: { affelnet_statut_initial: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );
  /** 3. On applique les règles de périmètres pour statut "à publier avec action attendue" uniquement sur les formations "non publiable en l'état" pour ne pas écraser les actions menées par les utilisateurs */
  logger.debug({ type: "job" }, "Etape 3.");

  const filterNonPubliable = {
    affelnet_statut_initial: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
  };

  const aPublierSoumisAValidationRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    is_deleted: { $ne: true },
  }).lean();

  if (aPublierSoumisAValidationRules.length > 0) {
    await Formation.updateMany(
      {
        ...filterReglement,
        ...filterSessionDate,
        ...filterNonPubliable,
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

  /** 4. On applique les règles de périmètre pour statut "à publier" pour les formations répondant aux règles de publication sur Parcoursup. */
  logger.debug({ type: "job" }, "Etape 4.");

  const filter = {
    affelnet_statut_initial: { $in: [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT, AFFELNET_STATUS.A_PUBLIER_VALIDATION] },
  };

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: AFFELNET_STATUS.A_PUBLIER,
    is_deleted: { $ne: true },
  }).lean();

  if (aPublierRules.length > 0) {
    await Formation.updateMany(
      {
        ...filterReglement,
        ...filterSessionDate,
        ...filter,
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

  /** 5. On applique les règles des académies */
  // logger.debug({ type: "job" }, "Etape 5.");

  // const academieRules = [...aPublierSoumisAValidationRules, ...aPublierRules].filter(
  //   ({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0
  // );

  // await asyncForEach(academieRules, async (rule) => {
  //   await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
  //     await Formation.updateMany(
  //       {
  //         ...filterReglement,
  //         ...filterSessionDate,

  //         num_academie,
  //         ...getQueryFromRule(rule, true),
  //       },
  //       [
  //         {
  //           $set: {
  //             affelnet_statut_initial: status,
  //           },
  //         },
  //       ]
  //     );
  //   });
  // });
};

module.exports = { run };
