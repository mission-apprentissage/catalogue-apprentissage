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
const { updateManyTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");

const run = async () => {
  const sessionStartDate = await getSessionStartDate();
  const sessionEndDate = await getSessionEndDate();
  const filterSessionDate = await getSessionDateRules();

  const filterReglement = {
    published: true,
    $and: [
      {
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
  logger.debug({ type: "job" }, "Etape 1. Vérification des aspects réglementaires");
  await Formation.updateMany(
    {
      $or: [
        {
          affelnet_statut: { $nin: [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.NON_PUBLIE] },
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
          ],
        },
        // Reset du statut si l'on supprime affelnet_id
        { affelnet_statut: AFFELNET_STATUS.PUBLIE, affelnet_id: null },
        // Initialisation du statut si non existant
        { affelnet_statut: null },
      ],
    },

    { $set: { affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  /** 2. On réinitialise les formations "à publier ..." à "non publiable en l'état" pour permettre le recalcule du périmètre */
  logger.debug({ type: "job" }, "Etape 2. Sauvegarde statut précédent et réinitialisation");

  await Formation.updateMany({}, [{ $set: { affelnet_last_statut: "$affelnet_statut" } }]);

  await Formation.updateMany(
    {
      affelnet_statut: {
        $in: [AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER, AFFELNET_STATUS.PRET_POUR_INTEGRATION],
      },
    },
    { $set: { affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  /** 3. On applique les règles de périmètres pour statut "à publier avec action attendue" uniquement sur les formations "non publiable en l'état" pour ne pas écraser les actions menées par les utilisateurs */
  logger.debug({ type: "job" }, "Etape 3. Application des règles avec action attendue");

  const aPublierSousConditions = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: {
      $in: [AFFELNET_STATUS.A_PUBLIER_VALIDATION],
    },
    is_deleted: { $ne: true },
  }).lean();

  const filterAPublierSousConditions = {
    affelnet_statut: {
      $in: [
        AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
        AFFELNET_STATUS.A_PUBLIER,
        AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        AFFELNET_STATUS.PRET_POUR_INTEGRATION,
      ],
    },
  };

  aPublierSousConditions.length > 0 &&
    (await asyncForEach(aPublierSousConditions, async (rule) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,
          ...filterAPublierSousConditions,

          ...getQueryFromRule(rule, true),
        },
        [
          {
            $set: {
              last_update_at: Date.now(),
              affelnet_statut: {
                $cond: {
                  if: {
                    $and: [
                      // {
                      //   $eq: ["$affelnet_id", null],
                      // },
                      {
                        $ne: ["$affelnet_last_statut", AFFELNET_STATUS.PRET_POUR_INTEGRATION],
                      },
                    ],
                  },
                  then: rule.statut,
                  else: AFFELNET_STATUS.PRET_POUR_INTEGRATION,
                },
              },
            },
          },
        ]
      );
    }));

  /** 4. On applique les règles de périmètre pour statut "à publier" pour les formations répondant aux règles de publication sur Affelnet. */
  logger.debug({ type: "job" }, "Etape 4. Application des règles sans action attendue");

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: {
      $in: [AFFELNET_STATUS.A_PUBLIER, AFFELNET_STATUS.PRET_POUR_INTEGRATION],
    },
    is_deleted: { $ne: true },
  }).lean();

  const filterAPublier = {
    affelnet_statut: {
      $in: [
        AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
        AFFELNET_STATUS.A_PUBLIER,
        AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        AFFELNET_STATUS.PRET_POUR_INTEGRATION,
      ],
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
            last_update_at: Date.now(),
            affelnet_statut: {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$affelnet_id", null],
                    },
                    {
                      $ne: ["$affelnet_last_statut", AFFELNET_STATUS.PRET_POUR_INTEGRATION],
                    },
                  ],
                },
                then: AFFELNET_STATUS.A_PUBLIER,
                else: AFFELNET_STATUS.PRET_POUR_INTEGRATION,
              },
            },
          },
        },
      ]
    );
  }

  /** 5. On applique les règles des académies */
  logger.debug({ type: "job" }, "Etape 5. Application des règles académiques");

  const academieRules = [...aPublierSousConditions].filter(
    ({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0
  );

  const filterAcademie = {
    affelnet_statut: {
      $in: [
        AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
        AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        AFFELNET_STATUS.A_PUBLIER,
        AFFELNET_STATUS.PRET_POUR_INTEGRATION,
      ],
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
              last_update_at: Date.now(),
              affelnet_statut: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: ["$affelnet_id", null],
                      },
                      {
                        $ne: ["$affelnet_last_statut", AFFELNET_STATUS.PRET_POUR_INTEGRATION],
                      },
                    ],
                  },
                  then: status,
                  else:
                    status === AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT
                      ? AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT
                      : AFFELNET_STATUS.PRET_POUR_INTEGRATION,
                },
              },
            },
          },
        ]
      );
    });
  });

  /** 6. Vérification de la date de publication */
  logger.debug({ type: "job" }, "Etape 6. Vérification de la date de publication");
  /** 6a. On s'assure que les dates de publication soient définies pour les formations publiées */
  await Formation.updateMany(
    {
      affelnet_published_date: null,
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    },
    { $set: { affelnet_published_date: new Date() } }
  );

  /** 6b. On s'assure que les dates de publication ne soient pas définies pour les formations non publiées */
  await Formation.updateMany(
    {
      affelnet_published_date: { $ne: null },
      affelnet_statut: { $ne: AFFELNET_STATUS.PUBLIE },
    },
    { $set: { affelnet_published_date: null } }
  );

  /** 7. On met à jour l'historique des statuts. */
  logger.debug({ type: "job" }, "Etape 7. Mise à jour de l'historique");
  await updateManyTagsHistory("affelnet_statut");
};

module.exports = { run };
