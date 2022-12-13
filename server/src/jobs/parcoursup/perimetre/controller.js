const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { getQueryFromRule } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/model");
const { updateTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const run = async () => {
  const next_campagne_debut = new Date("2023/08/01");
  const next_campagne_end = new Date("2024/07/31");

  const campagneDateFilter = {
    date_debut: { $gte: next_campagne_debut, $lt: next_campagne_end },
  };

  const campagneCount = await Formation.countDocuments(campagneDateFilter);

  console.log(`${campagneCount} formations possèdent des dates de début pour la campagne en cours.`);

  // 0. On initialise parcoursup_id à null si l'information n'existe pas sur la formation
  await Formation.updateMany({ parcoursup_id: { $exists: false } }, { $set: { parcoursup_id: null } });

  // const filterAllowedToReset = {
  //   parcoursup_statut: { $nin: [PARCOURSUP_STATUS.REJETE, PARCOURSUP_STATUS.NON_PUBLIE, PARCOURSUP_STATUS.PUBLIE] },
  // };

  // // 1 - set "hors périmètre"
  // await Formation.updateMany(
  //   {
  //     $or : [
  //       filterAllowedToReset,
  //       { parcoursup_statut: PARCOURSUP_STATUS.PUBLIE, parcoursup_id: null },
  //     ],
  //     $and: [
  //       {
  //         $or: [
  //           { parcoursup_statut: { $nin: [PARCOURSUP_STATUS.REJETE, PARCOURSUP_STATUS.PUBLIE] } },
  //           { parcoursup_statut: null },
  //           { catalogue_published: false },
  //           { published: false },
  //           {
  //             $or: [
  //               {
  //                 "rncp_details.code_type_certif": {
  //                   $in: ["Titre", "TP"],
  //                 },
  //                 "rncp_details.rncp_outdated": true,
  //               },
  //               {
  //                 "rncp_details.code_type_certif": {
  //                   $nin: ["Titre", "TP"],
  //                 },
  //                 cfd_outdated: true,
  //               },
  //             ],
  //           },
  //           { parcoursup_statut: PARCOURSUP_STATUS.PUBLIE, parcoursup_id: null },
  //         ],
  //       },
  //     ],
  //   },
  //   { $set: { parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE } }
  // );

  // 1. On réinitialise les formations "à publier ..." à "hors périmètre" pour permettre le recalcule du périmètre
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
    { $set: { parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE } }
  );

  // 2. On applique les règles de périmètres uniquement sur les formations "hors périmètre" pour ne pas écraser les actions menées par les utilisateurs
  const filterHP = {
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
  };

  const aPublierHabilitationRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
    is_deleted: { $ne: true },
  }).lean();

  aPublierHabilitationRules.length > 0 &&
    (await Formation.updateMany(
      {
        $and: [
          campagneDateFilter,
          filterHP,
          {
            $or: aPublierHabilitationRules.map(getQueryFromRule),
          },
        ],
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
        $and: [
          campagneDateFilter,
          filterHP,
          {
            $or: aPublierVerifierAccesDirectPostBacRules.map(getQueryFromRule),
          },
        ],
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
        $and: [
          campagneDateFilter,
          filterHP,
          {
            $or: aPublierValidationRecteurRules.map(getQueryFromRule),
          },
        ],
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

  // 3 - set "à publier" for trainings matching psup eligibility rules
  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filter = {
    parcoursup_statut: {
      $in: [
        PARCOURSUP_STATUS.HORS_PERIMETRE,
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
        $and: [
          campagneDateFilter,
          filter,
          {
            $or: aPublierRules.map(getQueryFromRule),
          },
        ],
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

  // apply academy rules
  const academieRules = [
    ...aPublierHabilitationRules,
    ...aPublierVerifierAccesDirectPostBacRules,
    ...aPublierValidationRecteurRules,
    ...aPublierRules,
  ].filter(({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0);

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      console.log(status);
      await Formation.updateMany(
        {
          $and: [
            campagneDateFilter,
            {
              parcoursup_statut: {
                $in: [
                  PARCOURSUP_STATUS.HORS_PERIMETRE,
                  PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
                  PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
                  PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
                  PARCOURSUP_STATUS.A_PUBLIER,
                ],
              },
            },
            {
              num_academie,
              ...getQueryFromRule(rule),
            },
          ],
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
                    status === PARCOURSUP_STATUS.HORS_PERIMETRE
                      ? PARCOURSUP_STATUS.HORS_PERIMETRE
                      : PARCOURSUP_STATUS.EN_ATTENTE,
                },
              },
            },
          },
        ]
      );
    });
  });

  // ensure published date is set
  await Formation.updateMany(
    {
      $and: [
        {
          parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
        },
        {
          parcoursup_published_date: null,
          parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
        },
      ],
    },
    { $set: { parcoursup_published_date: new Date() } }
  );

  // ensure published date is not set
  await Formation.updateMany(
    {
      $and: [
        {
          parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
        },
        {
          parcoursup_published_date: { $ne: null },
          parcoursup_statut: { $ne: PARCOURSUP_STATUS.PUBLIE },
        },
      ],
    },
    { $set: { parcoursup_published_date: null } }
  );

  // Push entry in tags history
  await updateTagsHistory("parcoursup_statut");

  // stats
  const totalPublished = await Formation.countDocuments({ published: true });
  const totalNotRelevant = await Formation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
  });
  const totalToValidateHabilitation = await Formation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });
  const totalToValidate = await Formation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });
  const totalToValidateRecteur = await Formation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });
  const totalToCheck = await Formation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });
  const totalPending = await Formation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
  });
  const totalRejected = await Formation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });
  const totalPsPublished = await Formation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalPsNotPublished = await Formation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });

  logger.info(
    `Total formations publiées dans le catalogue : ${totalPublished}\n` +
      `Total formations hors périmètre : ${totalNotRelevant}/${totalPublished}\n` +
      `Total formations à publier (sous condition habilitation) : ${totalToValidateHabilitation}/${totalPublished}\n` +
      `Total formations à publier (vérifier accès direct postbac) : ${totalToValidate}/${totalPublished}\n` +
      `Total formations à publier (soumis à validation Recteur) : ${totalToValidateRecteur}/${totalPublished}\n` +
      `Total formations à publier : ${totalToCheck}/${totalPublished}\n` +
      `Total formations en attente de publication : ${totalPending}/${totalPublished}\n` +
      `Total formations publiées sur ParcourSup : ${totalPsPublished}/${totalPublished}\n` +
      `Total formations rejetée par ParcourSup : ${totalRejected}/${totalPublished}\n` +
      `Total formations NON publiées sur ParcourSup : ${totalPsNotPublished}/${totalPublished}`
  );
};

module.exports = { run };
