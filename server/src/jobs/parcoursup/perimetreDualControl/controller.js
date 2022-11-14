const { DualControlFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { getQueryFromRule } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre, DualControlPerimeterReport } = require("../../../common/model");
const { updateTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const run = async () => {
  // await DualControlFormation.updateMany({}, { $set: { catalogue_published: true, published: true } });

  // 1 - set "hors périmètre"
  await DualControlFormation.updateMany(
    {
      parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
      $or: [
        { parcoursup_statut: null },
        { catalogue_published: false },
        { published: false },
        {
          $or: [
            {
              "rncp_details.code_type_certif": {
                $in: ["Titre", "TP"],
              },
              "rncp_details.rncp_outdated": true,
            },
            {
              "rncp_details.code_type_certif": {
                $nin: ["Titre", "TP"],
              },
              cfd_outdated: true,
            },
          ],
        },
        { parcoursup_id: null, parcoursup_statut: PARCOURSUP_STATUS.PUBLIE },
      ],
    },
    { $set: { parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE } }
  );

  // set "publié"
  await DualControlFormation.updateMany(
    {
      $and: [
        {
          parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
        },
        {
          published: true,
          catalogue_published: true,
          parcoursup_id: { $ne: null },
          parcoursup_statut: { $ne: PARCOURSUP_STATUS.NON_PUBLIE },
        },
      ],
    },
    { $set: { parcoursup_statut: PARCOURSUP_STATUS.PUBLIE } }
  );

  // set "à publier (vérifier accès direct postbac)" & "à publier (soumis à validation Recteur)" for trainings matching psup eligibility rules
  // reset "à publier" & "à publier (vérifier accès direct postbac)" & "à publier (soumis à validation Recteur)"
  await DualControlFormation.updateMany(
    {
      $and: [
        {
          parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
        },
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
      ],
    },
    { $set: { parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE } }
  );

  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filterHP = {
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
  };

  const aPublierHabilitationRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
    is_deleted: { $ne: true },
  }).lean();

  aPublierHabilitationRules.length > 0 &&
    (await DualControlFormation.updateMany(
      {
        $and: [
          {
            parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
          },
          {
            ...filterHP,
            $or: aPublierHabilitationRules.map(getQueryFromRule),
          },
        ],
      },
      {
        $set: {
          last_update_at: Date.now(),
          parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
        },
      }
    ));

  const aPublierVerifierAccesDirectPostBacRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    is_deleted: { $ne: true },
  }).lean();

  aPublierVerifierAccesDirectPostBacRules.length > 0 &&
    (await DualControlFormation.updateMany(
      {
        $and: [
          {
            parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
          },
          {
            ...filterHP,
            $or: aPublierVerifierAccesDirectPostBacRules.map(getQueryFromRule),
          },
        ],
      },
      {
        $set: {
          last_update_at: Date.now(),
          parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        },
      }
    ));

  const aPublierValidationRecteurRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    is_deleted: { $ne: true },
  }).lean();

  aPublierValidationRecteurRules.length > 0 &&
    (await DualControlFormation.updateMany(
      {
        $and: [
          {
            parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
          },
          {
            ...filterHP,
            $or: aPublierValidationRecteurRules.map(getQueryFromRule),
          },
        ],
      },
      {
        $set: {
          last_update_at: Date.now(),
          parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
        },
      }
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
    (await DualControlFormation.updateMany(
      {
        $and: [
          {
            parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
          },
          {
            ...filter,
            $or: aPublierRules.map(getQueryFromRule),
          },
        ],
      },
      {
        $set: {
          last_update_at: Date.now(),
          parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
        },
      }
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
      await DualControlFormation.updateMany(
        {
          $and: [
            {
              parcoursup_statut: { $ne: PARCOURSUP_STATUS.REJETE },
            },
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
              num_academie,
              ...getQueryFromRule(rule),
            },
          ],
        },
        { $set: { last_update_at: Date.now(), parcoursup_statut: status } }
      );
    });
  });

  // ensure published date is set
  await DualControlFormation.updateMany(
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
    { $set: { parcoursup_published_date: Date.now() } }
  );

  // ensure published date is not set
  await DualControlFormation.updateMany(
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
  const totalPublished = await DualControlFormation.countDocuments({ published: true });
  const totalNotRelevant = await DualControlFormation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
  });
  const totalToValidateHabilitation = await DualControlFormation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });
  const totalToValidate = await DualControlFormation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });
  const totalToValidateRecteur = await DualControlFormation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });
  const totalToCheck = await DualControlFormation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });
  const totalPending = await DualControlFormation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
  });
  const totalRejected = await DualControlFormation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });
  const totalPsPublished = await DualControlFormation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalPsNotPublished = await DualControlFormation.countDocuments({
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });

  const toLog =
    `Total formations publiées dans le catalogue : ${totalPublished}\n` +
    `Total formations hors périmètre : ${totalNotRelevant}/${totalPublished}\n` +
    `Total formations à publier (sous condition habilitation)" : ${totalToValidateHabilitation}/${totalPublished}\n` +
    `Total formations à publier (vérifier accès direct postbac)" : ${totalToValidate}/${totalPublished}\n` +
    `Total formations à publier (soumis à validation Recteur)" : ${totalToValidateRecteur}/${totalPublished}\n` +
    `Total formations à publier : ${totalToCheck}/${totalPublished}\n` +
    `Total formations en attente de publication : ${totalPending}/${totalPublished}\n` +
    `Total formations publiées sur ParcourSup : ${totalPsPublished}/${totalPublished}\n` +
    `Total formations rejetée par ParcourSup : ${totalRejected}/${totalPublished}\n` +
    `Total formations NON publiées sur ParcourSup : ${totalPsNotPublished}/${totalPublished}`;

  console.log(toLog);
  logger.info(toLog);

  return await DualControlPerimeterReport.create({
    plateforme: "parcoursup",
    statuts: {
      totalPublished,
      totalNotRelevant,
      totalToValidateHabilitation,
      totalToValidate,
      totalToValidateRecteur,
      totalToCheck,
      totalPending,
      totalPsPublished,
      totalRejected,
      totalPsNotPublished,
    },
  });
};

module.exports = { run };
