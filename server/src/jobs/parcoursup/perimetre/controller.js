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
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { updateManyTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");

const excludedRNCPs = [];
const excludedSIRETs = ["94981602900019", "94998347200018"];

const run = async () => {
  const sessionStartDate = await getSessionStartDate();
  const sessionEndDate = await getSessionEndDate();
  const filterSessionDate = await getSessionDateRules();

  const filterReglement = {
    published: true,
    $or: [{ catalogue_published: true }, { force_published: true }],
    $and: [
      {
        rncp_code: {
          $nin: excludedRNCPs,
        },
      },
      {
        etablissement_gestionnaire_siret: {
          $nin: excludedSIRETs,
        },
        etablissement_formateur_siret: {
          $nin: excludedSIRETs,
        },
      },
      notOutdatedRule,
    ],
  };

  const campagneCount = await Formation.countDocuments(filterSessionDate);

  logger.debug({ type: "job" }, `${campagneCount} formations possèdent des dates de début pour la campagne en cours.`);

  await Formation.updateMany(
    {
      parcoursup_perimetre: true,
      parcoursup_session: true,
      $or: [
        {
          etablissement_gestionnaire_siret: {
            $in: excludedSIRETs,
          },
        },
        {
          etablissement_formateur_siret: {
            $in: excludedSIRETs,
          },
        },
      ],
    },
    {
      $set: {
        parcoursup_statut: "non publié",
        parcoursup_raison_depublication: "Non autorisé (Drafpica, Draaf, Moss, SAIO)",
        parcoursup_raison_depublication_precision: "Déréférencement 2025 suite rappel à la charte",
      },
    }
  );

  /** 0. On initialise parcoursup_id à null si l'information n'existe pas sur la formation */
  logger.info({ type: "job" }, "Etape 0.");
  await Formation.updateMany({ parcoursup_id: { $exists: false } }, { $set: { parcoursup_id: null } });

  /** 1. Application de la réglementation : réinitialisation des étiquettes pour les formations qui sortent du périmètre quelque soit le statut (sauf publié, fermé, non publié) */
  logger.info({ type: "job" }, "Etape 1. Vérification des aspects réglementaires");
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
              CI_inscrit_rncp: "3 - Inscrit de droit",
              cfd_outdated: true,
            },
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

            // Date de début hors campagne en cours.
            { date_debut: { $not: { $gte: sessionStartDate, $lt: sessionEndDate } } },
            // Sur des codes RNCPs temporairement non autorisés
            {
              rncp_code: {
                $in: excludedRNCPs,
              },
            },
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

  /** 2. On sauvegarde le précédent statut */
  logger.info({ type: "job" }, "Etape 2. Sauvegarde statut précédent");

  await Formation.updateMany({}, [{ $set: { parcoursup_last_statut: "$parcoursup_statut" } }], {
    updatePipeline: true,
  });

  /** 3. On réinitialise les statuts des formations pour permettre le recalcule du périmètre */
  logger.info({ type: "job" }, "Etape 3. Réinitialisation des statuts");

  const filterStatus = {
    parcoursup_statut: {
      $in: [
        PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
        PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
        PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
        PARCOURSUP_STATUS.A_PUBLIER,
        PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
        PARCOURSUP_STATUS.EN_ATTENTE,
        PARCOURSUP_STATUS.REJETE,
        PARCOURSUP_STATUS.ERROR,
      ],
    },
  };

  await Formation.updateMany(
    {
      ...filterStatus,
    },
    { $set: { parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  /** 4. On applique les règles de périmètres. */
  logger.info({ type: "job" }, "Etape 4. Application des règles");

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
      logger.debug(
        { type: "job" },
        `[national] ${rule.diplome} ${rule.nom_regle_complementaire ? `[${rule.nom_regle_complementaire}]` : ""} => ${rule.statut} [${await Formation.countDocuments(
          {
            ...filterReglement,
            ...filterSessionDate,
            ...filterStatus,

            ...getQueryFromRule(rule, true),
          }
        )} formations concernées]`
      );

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
              parcoursup_statut: rule.statut,
            },
          },
        ],
        { updatePipeline: true }
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
      logger.debug(
        { type: "job" },
        `[national] ${rule.diplome} ${rule.nom_regle_complementaire ? `[${rule.nom_regle_complementaire}]` : ""} => ${rule.statut} [${await Formation.countDocuments(
          {
            ...filterReglement,
            ...filterSessionDate,
            ...filterStatus,

            ...getQueryFromRule(rule, true),
          }
        )} formations concernées]`
      );

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
              parcoursup_statut: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $in: [
                          "$parcoursup_last_statut",
                          [
                            PARCOURSUP_STATUS.PUBLIE,
                            PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
                            PARCOURSUP_STATUS.EN_ATTENTE,
                            PARCOURSUP_STATUS.REJETE,
                            PARCOURSUP_STATUS.ERROR,
                          ],
                        ],
                      },
                      then: "$parcoursup_last_statut",
                    },
                  ],
                  default: rule.statut,
                },
              },
            },
          },
        ],
        { updatePipeline: true }
      );
    }));

  // Les règles pour lesquelles on procède à des publications automatiques et qui peuvent être publiées par les instructeurs
  const statusPublicationAutomatique = [PARCOURSUP_STATUS.A_PUBLIER];
  const reglesPublicationAutomatique = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: { $in: statusPublicationAutomatique },
    is_deleted: { $ne: true },
  }).lean();

  reglesPublicationAutomatique.length > 0 &&
    (await asyncForEach(reglesPublicationAutomatique, async (rule) => {
      logger.debug(
        { type: "job" },
        `[national] ${rule.diplome} ${rule.nom_regle_complementaire ? `[${rule.nom_regle_complementaire}]` : ""} => ${rule.statut} [${await Formation.countDocuments(
          {
            ...filterReglement,
            ...filterSessionDate,
            ...filterStatus,

            ...getQueryFromRule(rule, true),
          }
        )} formations concernées]`
      );

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
              parcoursup_statut: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $in: [
                          "$parcoursup_last_statut",
                          [
                            PARCOURSUP_STATUS.PUBLIE,
                            PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
                            PARCOURSUP_STATUS.EN_ATTENTE,
                            PARCOURSUP_STATUS.REJETE,
                            PARCOURSUP_STATUS.ERROR,
                          ],
                        ],
                      },
                      then: "$parcoursup_last_statut",
                    },
                    {
                      case: {
                        $ne: ["$parcoursup_id", null],
                      },
                      then: statusPublicationAutomatique.includes(rule.statut)
                        ? PARCOURSUP_STATUS.PRET_POUR_INTEGRATION
                        : rule.statut,
                    },
                  ],
                  default: rule.statut,
                },
              },
            },
          },
        ],
        { updatePipeline: true }
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
      logger.debug(
        { type: "job" },
        `[${num_academie}] ${rule.diplome} ${rule.nom_regle_complementaire ? `[${rule.nom_regle_complementaire}]` : ""} => ${status} [${await Formation.countDocuments(
          {
            ...filterReglement,
            ...filterSessionDate,
            ...filterStatus,

            num_academie,

            ...getQueryFromRule(rule, true),
          }
        )} formations concernées]`
      );

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
              parcoursup_statut: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $in: [status, [PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT]],
                      },
                      then: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
                    },
                    {
                      case: {
                        $in: [
                          "$parcoursup_last_statut",
                          [
                            PARCOURSUP_STATUS.PUBLIE,
                            PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
                            PARCOURSUP_STATUS.EN_ATTENTE,
                            PARCOURSUP_STATUS.REJETE,
                            PARCOURSUP_STATUS.ERROR,
                          ],
                        ],
                      },
                      then: "$parcoursup_last_statut",
                    },
                    {
                      case: {
                        $ne: ["$parcoursup_id", null],
                      },
                      then: statusPublicationAutomatique.includes(status)
                        ? PARCOURSUP_STATUS.PRET_POUR_INTEGRATION
                        : status,
                    },
                  ],
                  default: status,
                },
              },
            },
          },
        ],
        { updatePipeline: true }
      );
    });
  });

  /** 5. Vérification de la date de publication */
  logger.info({ type: "job" }, "Etape 5. Vérification de la date de publication");
  /** 5a. On s'assure que les dates de publication soient définies pour les formations publiées */
  await Formation.updateMany(
    {
      parcoursup_published_date: null,
      parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
    },
    { $set: { parcoursup_published_date: new Date() } }
  );

  /** 5b. On s'assure que les dates de publication ne soient pas définies pour les formations non publiées */
  await Formation.updateMany(
    {
      parcoursup_published_date: { $ne: null },
      parcoursup_statut: { $ne: PARCOURSUP_STATUS.PUBLIE },
    },
    { $set: { parcoursup_published_date: null } }
  );

  /** 6. On met à jour l'historique des statuts. */
  logger.info({ type: "job" }, "Etape 6. Mise à jour de l'historique");
  await updateManyTagsHistory("parcoursup_statut");
};

module.exports = { run };
