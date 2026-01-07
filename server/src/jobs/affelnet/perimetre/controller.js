const logger = require("../../../common/logger");
const { Formation, ReglePerimetre } = require("../../../common/models");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const {
  getQueryFromRule,
  getSessionStartDate,
  getSessionEndDate,
  getSessionDateRules,
  notOutdatedRule,
} = require("../../../common/utils/rulesUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");
const { updateManyTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");

const run = async () => {
  const sessionStartDate = await getSessionStartDate();
  const sessionEndDate = await getSessionEndDate();
  const filterSessionDate = await getSessionDateRules();

  const filterReglement = {
    // Les formations à distance ne sont pas dans le périmètre
    cle_ministere_educatif: { $not: /#LAD$/ },
    published: true,
    $or: [{ catalogue_published: true }, { force_published: true }],
    $and: [notOutdatedRule],
  };

  const campagneCount = await Formation.countDocuments(filterSessionDate);

  logger.debug({ type: "job" }, `${campagneCount} formations possèdent des dates de début pour la campagne en cours.`);

  /** 0. On initialise affelnet_id à null si l'information n'existe pas sur la formation */
  logger.debug({ type: "job" }, "Etape 0.");
  await Formation.updateMany({ affelnet_id: { $exists: false } }, { $set: { affelnet_id: null } });

  /** 1. Application de la réglementation : réinitialisation des étiquettes pour les formations qui sortent du périmètre quelque soit le statut (sauf publié et non publié pour le moment) */
  logger.debug({ type: "job" }, "Etape 1. Vérification des aspects réglementaires");
  await Formation.updateMany(
    {
      $or: [
        {
          affelnet_statut: {
            $nin: [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.NON_PUBLIE],
          },
          $or: [
            { cle_ministere_educatif: /#LAD$/ },
            // Plus dans le flux
            { published: false },
            // Plus dans le catalogue général
            { catalogue_published: false, forced_published: { $ne: true } },
            // Diplôme périmé
            {
              CI_inscrit_rncp: {
                $ne: "3 - Inscrit de droit",
              },
              rncp_code: { $exists: true, $ne: null },
              "rncp_details.rncp_outdated": true,
            },
            {
              CI_inscrit_rncp: {
                $ne: "3 - Inscrit de droit",
              },
              rncp_code: { $eq: null },
              cfd_outdated: true,
            },
            {
              CI_inscrit_rncp: {
                $eq: "3 - Inscrit de droit",
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

  /** 2. On sauvegarde le précédent statut */
  logger.debug({ type: "job" }, "Etape 2. Sauvegarde statut précédent");

  await Formation.updateMany({}, [{ $set: { affelnet_last_statut: "$affelnet_statut" } }]);

  /** 3. On réinitialise les statuts des formations our permettre le recalcule du périmètre */
  logger.debug({ type: "job" }, "Etape 3. Réinitialisation des statuts");

  const filterStatus = {
    affelnet_statut: {
      $in: [
        AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
        AFFELNET_STATUS.A_DEFINIR,
        AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        AFFELNET_STATUS.A_PUBLIER,
        AFFELNET_STATUS.PRET_POUR_INTEGRATION,
        AFFELNET_STATUS.EN_ATTENTE,
        AFFELNET_STATUS.PUBLIE,
      ],
    },
  };

  await Formation.updateMany(
    {
      ...filterStatus,
    },
    { $set: { affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  /** 4. On applique les règles de périmètres. */
  logger.debug({ type: "job" }, "Etape 4. Application des règles");

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
      // console.log(
      //   `[national] ${rule.diplome} ${rule.nom_regle_complementaire ? `[${rule.nom_regle_complementaire}]` : ""} => ${rule.statut} [${await Formation.countDocuments(
      //     {
      //       ...filterReglement,
      //       ...filterSessionDate,
      //       ...filterStatus,

      //       ...getQueryFromRule(rule, true),
      //     }
      //   )} formations concernées]`
      // );

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
              last_update_at: Date.now(),
              affelnet_statut: rule.statut,
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
      // console.log(
      //   `[national] ${rule.diplome} ${rule.nom_regle_complementaire ? `[${rule.nom_regle_complementaire}]` : ""} => ${rule.statut} [${await Formation.countDocuments(
      //     {
      //       ...filterReglement,
      //       ...filterSessionDate,
      //       ...filterStatus,

      //       ...getQueryFromRule(rule, true),
      //     }
      //   )} formations concernées]`
      // );

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
              last_update_at: Date.now(),
              affelnet_statut: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $in: [
                          "$affelnet_last_statut",
                          [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.PRET_POUR_INTEGRATION, AFFELNET_STATUS.EN_ATTENTE],
                        ],
                      },
                      then: "$affelnet_last_statut",
                    },
                  ],
                  default: rule.statut,
                },
              },
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
      // console.log(
      //   `[national] ${rule.diplome} ${rule.nom_regle_complementaire ? `[${rule.nom_regle_complementaire}]` : ""} => ${rule.statut} [${await Formation.countDocuments(
      //     {
      //       ...filterReglement,
      //       ...filterSessionDate,
      //       ...filterStatus,

      //       ...getQueryFromRule(rule, true),
      //     }
      //   )} formations concernées]`
      // );

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
              last_update_at: Date.now(),
              affelnet_statut: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $in: [
                          "$affelnet_last_statut",
                          [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.PRET_POUR_INTEGRATION, AFFELNET_STATUS.EN_ATTENTE],
                        ],
                      },
                      then: "$affelnet_last_statut",
                    },
                    {
                      case: {
                        $ne: ["$affelnet_id", null],
                      },
                      then: statusPublicationAutomatique.includes(rule.statut)
                        ? AFFELNET_STATUS.PRET_POUR_INTEGRATION
                        : rule.statut,
                    },
                  ],
                  default: rule.statut,
                },
              },
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
      // console.log(
      //   `[${num_academie}] ${rule.diplome} ${rule.nom_regle_complementaire ? `[${rule.nom_regle_complementaire}]` : ""} => ${status} [${await Formation.countDocuments(
      //     {
      //       ...filterReglement,
      //       ...filterSessionDate,
      //       ...filterStatus,

      //       num_academie,

      //       ...getQueryFromRule(rule, true),
      //     }
      //   )} formations concernées]`
      // );

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
              last_update_at: Date.now(),
              affelnet_statut: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $in: [status, [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT]],
                      },
                      then: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
                    },
                    {
                      case: {
                        $in: [
                          "$affelnet_last_statut",
                          [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.PRET_POUR_INTEGRATION, AFFELNET_STATUS.EN_ATTENTE],
                        ],
                      },
                      then: "$affelnet_last_statut",
                    },
                    {
                      case: {
                        $ne: ["$affelnet_id", null],
                      },
                      then: statusPublicationAutomatique.includes(status)
                        ? AFFELNET_STATUS.PRET_POUR_INTEGRATION
                        : status,
                    },
                  ],
                  default: status,
                },
              },
            },
          },
        ]
      );
    });
  });

  /** 5. Vérification de la date de publication */
  logger.debug({ type: "job" }, "Etape 5. Vérification de la date de publication");
  /** 5a. On s'assure que les dates de publication soient définies pour les formations publiées */
  await Formation.updateMany(
    {
      affelnet_published_date: null,
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    },
    { $set: { affelnet_published_date: new Date() } }
  );

  /** 5b. On s'assure que les dates de publication ne soient pas définies pour les formations non publiées */
  await Formation.updateMany(
    {
      affelnet_published_date: { $ne: null },
      affelnet_statut: { $ne: AFFELNET_STATUS.PUBLIE },
    },
    { $set: { affelnet_published_date: null } }
  );

  /** 6. On met à jour l'historique des statuts. */
  logger.debug({ type: "job" }, "Etape 6. Mise à jour de l'historique");
  await updateManyTagsHistory("affelnet_statut");
};

module.exports = { run };
