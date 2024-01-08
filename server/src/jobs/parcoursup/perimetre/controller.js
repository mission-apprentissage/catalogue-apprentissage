const logger = require("../../../common/logger");
const { Formation, ReglePerimetre } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const {
  getQueryFromRule,
  getSessionStartDate,
  getSessionEndDate,
  getSessionDateRules,
} = require("../../../common/utils/rulesUtils");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { updateTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");

const run = async () => {
  const sessionStartDate = getSessionStartDate();
  const sessionEndDate = getSessionEndDate();
  const filterSessionDate = getSessionDateRules();

  const filterReglement = {
    $and: [
      {
        published: true,
      },
      {
        $or: [{ catalogue_published: true }, { force_published: true }],
      },
      {
        $or: [
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP", null],
            },
            rncp_code: { $exists: true },
            "rncp_details.rncp_outdated": false,
          },
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP", null],
            },
            rncp_code: { $exists: false },
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

  // 0. On initialise parcoursup_id à null si l'information n'existe pas sur la formation
  logger.debug({ type: "job" }, "Etape 0.");
  await Formation.updateMany({ parcoursup_id: { $exists: false } }, { $set: { parcoursup_id: null } });

  // 1. Application de la réglementation : réinitialisation des étiquettes pour les formations qui sortent du périmètre quelque soit le statut (sauf publié pour le moment)
  logger.debug({ type: "job" }, "Etape 1.");
  await Formation.updateMany(
    {
      $or: [
        {
          parcoursup_statut: {
            $nin: [PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.FERME, PARCOURSUP_STATUS.NON_PUBLIE],
          },
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
              rncp_code: { $exists: true },
              "rncp_details.rncp_outdated": true,
            },
            {
              "rncp_details.code_type_certif": {
                $in: ["Titre", "TP", null],
              },
              rncp_code: { $exists: false },
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
          ],
        },
        // Reset du statut si l'on supprime parcoursup_id
        { parcoursup_statut: PARCOURSUP_STATUS.PUBLIE, parcoursup_id: null },
        // Initialisation du statut si non existant
        { parcoursup_statut: null },
      ],
    },
    { $set: { parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  // 2. On réinitialise les formations "à publier ..." à "non publiable en l'état" pour permettre le recalcule du périmètre
  logger.debug({ type: "job" }, "Etape 2.");
  await Formation.updateMany(
    {
      parcoursup_statut: {
        $in: [
          PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
          PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
          PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
          PARCOURSUP_STATUS.A_PUBLIER,
        ],
      },
    },
    { $set: { parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  // 3. On applique les règles de périmètres pour statut "à publier avec action attendue" uniquement sur les formations "non publiable en l'état" pour ne pas écraser les actions menées par les utilisateurs
  logger.debug({ type: "job" }, "Etape 3.");
  const filterHP = {
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  };

  const aPublierHabilitationRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
    is_deleted: { $ne: true },
  }).lean();

  aPublierHabilitationRules.length > 0 &&
    (await Formation.updateMany(
      {
        ...filterReglement,
        ...filterSessionDate,
        ...filterHP,
        $or: aPublierHabilitationRules.map(getQueryFromRule),
      },
      [
        {
          $set: {
            last_update_at: Date.now(),
            parcoursup_statut: {
              $cond: {
                if: {
                  $eq: ["$parcoursup_id", null],
                },
                then: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
                else: PARCOURSUP_STATUS.EN_ATTENTE,
              },
            },
          },
        },
      ]
    ));

  const aPublierVerifierAccesDirectPostBacRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    is_deleted: { $ne: true },
  }).lean();

  aPublierVerifierAccesDirectPostBacRules.length > 0 &&
    (await Formation.updateMany(
      {
        ...filterReglement,
        ...filterSessionDate,
        ...filterHP,
        $or: aPublierVerifierAccesDirectPostBacRules.map(getQueryFromRule),
      },
      [
        {
          $set: {
            last_update_at: Date.now(),
            parcoursup_statut: {
              $cond: {
                if: {
                  $eq: ["$parcoursup_id", null],
                },
                then: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
                else: PARCOURSUP_STATUS.EN_ATTENTE,
              },
            },
          },
        },
      ]
    ));

  const aPublierValidationRecteurRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    is_deleted: { $ne: true },
  }).lean();

  aPublierValidationRecteurRules.length > 0 &&
    (await Formation.updateMany(
      {
        ...filterReglement,
        ...filterSessionDate,
        ...filterHP,

        $or: aPublierValidationRecteurRules.map(getQueryFromRule),
      },
      [
        {
          $set: {
            last_update_at: Date.now(),
            parcoursup_statut: {
              $cond: {
                if: {
                  $eq: ["$parcoursup_id", null],
                },
                then: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
                else: PARCOURSUP_STATUS.EN_ATTENTE,
              },
            },
          },
        },
      ]
    ));

  // 4. On applique les règles de périmètre pour statut "à publier" pour les formations répondant aux règles de publication sur Parcoursup.
  logger.debug({ type: "job" }, "Etape 4.");
  const filter = {
    parcoursup_statut: {
      $in: [
        PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
        PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
      ],
    },
  };

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    is_deleted: { $ne: true },
  }).lean();

  aPublierRules.length > 0 &&
    (await Formation.updateMany(
      {
        ...filterReglement,
        ...filterSessionDate,
        ...filter,

        $or: aPublierRules.map(getQueryFromRule),
      },
      [
        {
          $set: {
            last_update_at: Date.now(),
            parcoursup_statut: {
              $cond: {
                if: {
                  $eq: ["$parcoursup_id", null],
                },
                then: PARCOURSUP_STATUS.A_PUBLIER,
                else: PARCOURSUP_STATUS.EN_ATTENTE,
              },
            },
          },
        },
      ]
    ));

  // 5. On applique les règles des académies
  logger.debug({ type: "job" }, "Etape 5.");
  const academieRules = [
    ...aPublierHabilitationRules,
    ...aPublierVerifierAccesDirectPostBacRules,
    ...aPublierValidationRecteurRules,
    ...aPublierRules,
  ].filter(({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0);

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      logger.debug({ type: "job" }, status);
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,

          parcoursup_statut: {
            $in: [
              PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
              PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
              PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
              PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
              PARCOURSUP_STATUS.A_PUBLIER,
            ],
          },

          num_academie,
          ...getQueryFromRule(rule),
        },
        [
          {
            $set: {
              last_update_at: Date.now(),
              parcoursup_statut: {
                $cond: {
                  if: {
                    $eq: ["$parcoursup_id", null],
                  },
                  then: status,
                  else:
                    status === PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT
                      ? PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT
                      : PARCOURSUP_STATUS.EN_ATTENTE,
                },
              },
            },
          },
        ]
      );
    });
  });

  logger.debug({ type: "job" }, "Etape 6.");
  // 6a. On s'assure que les dates de publication sont définies pour les formations publiées
  await Formation.updateMany(
    {
      parcoursup_published_date: null,
      parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
    },
    { $set: { parcoursup_published_date: new Date() } }
  );

  // 6b. On s'assure que les dates de publication ne sont pas définies pour les formations non publiées
  await Formation.updateMany(
    {
      parcoursup_published_date: { $ne: null },
      parcoursup_statut: { $ne: PARCOURSUP_STATUS.PUBLIE },
    },
    { $set: { parcoursup_published_date: null } }
  );

  // 7. On met à jour l'historique des statuts.
  logger.debug({ type: "job" }, "Etape 7.");
  await updateTagsHistory("parcoursup_statut");
};

module.exports = { run };
