const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { getQueryFromRule } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/model");
const { updateTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

const run = async () => {
  // 1 - set "hors périmètre"
  await Formation.updateMany(
    {
      $or: [
        { parcoursup_statut: null },
        { etablissement_reference_catalogue_published: false },
        { published: false },
        { cfd_outdated: true },
      ],
    },
    { $set: { parcoursup_statut: "hors périmètre" } }
  );

  // set "à publier (vérifier accès direct postbac)" & "à publier (soumis à validation Recteur)" for trainings matching psup eligibility rules
  // reset "à publier" & "à publier (vérifier accès direct postbac)" & "à publier (soumis à validation Recteur)"
  await Formation.updateMany(
    {
      parcoursup_statut: {
        $in: [
          "à publier (sous condition habilitation)",
          "à publier (soumis à validation)",
          "à publier (vérifier accès direct postbac)",
          "à publier (soumis à validation Recteur)",
          "à publier",
        ],
      },
    },
    { $set: { parcoursup_statut: "hors périmètre" } }
  );

  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filterHP = {
    parcoursup_statut: "hors périmètre",
  };

  const aPublierHabilitationRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: "à publier (sous condition habilitation)",
    is_deleted: { $ne: true },
  }).lean();

  aPublierHabilitationRules.length > 0 &&
    (await Formation.updateMany(
      {
        ...filterHP,
        $or: aPublierHabilitationRules.map(getQueryFromRule),
      },
      { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier (sous condition habilitation)" } }
    ));

  const aPublierVerifierAccesDirectPostBacRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: "à publier (vérifier accès direct postbac)",
    is_deleted: { $ne: true },
  }).lean();

  aPublierVerifierAccesDirectPostBacRules.length > 0 &&
    (await Formation.updateMany(
      {
        ...filterHP,
        $or: aPublierVerifierAccesDirectPostBacRules.map(getQueryFromRule),
      },
      { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier (vérifier accès direct postbac)" } }
    ));

  const aPublierValidationRecteurRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: "à publier (soumis à validation Recteur)",
    is_deleted: { $ne: true },
  }).lean();

  aPublierValidationRecteurRules.length > 0 &&
    (await Formation.updateMany(
      {
        ...filterHP,
        $or: aPublierValidationRecteurRules.map(getQueryFromRule),
      },
      { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier (soumis à validation Recteur)" } }
    ));

  // 3 - set "à publier" for trainings matching psup eligibility rules
  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filter = {
    parcoursup_statut: {
      $in: ["hors périmètre", "à publier (vérifier accès direct postbac)", "à publier (soumis à validation Recteur)"],
    },
  };

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: "à publier",
    is_deleted: { $ne: true },
  }).lean();

  aPublierRules.length > 0 &&
    (await Formation.updateMany(
      {
        ...filter,
        $or: aPublierRules.map(getQueryFromRule),
      },
      { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier" } }
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
      await Formation.updateMany(
        {
          parcoursup_statut: {
            $in: [
              "hors périmètre",
              "à publier (sous condition habilitation)",
              "à publier (vérifier accès direct postbac)",
              "à publier (soumis à validation Recteur)",
              "à publier",
            ],
          },
          num_academie,
          ...getQueryFromRule(rule),
        },
        { $set: { last_update_at: Date.now(), parcoursup_statut: status } }
      );
    });
  });

  // Push entry in tags history
  await updateTagsHistory("parcoursup_statut");

  // stats
  const totalPublished = await Formation.countDocuments({ published: true });
  const totalNotRelevant = await Formation.countDocuments({
    published: true,
    parcoursup_statut: "hors périmètre",
  });
  const totalToValidateHabilitation = await Formation.countDocuments({
    published: true,
    parcoursup_statut: "à publier (sous condition habilitation)",
  });
  const totalToValidate = await Formation.countDocuments({
    published: true,
    parcoursup_statut: "à publier (vérifier accès direct postbac)",
  });
  const totalToValidateRecteur = await Formation.countDocuments({
    published: true,
    parcoursup_statut: "à publier (soumis à validation Recteur)",
  });
  const totalToCheck = await Formation.countDocuments({ published: true, parcoursup_statut: "à publier" });
  const totalPending = await Formation.countDocuments({
    published: true,
    parcoursup_statut: "en attente de publication",
  });
  const totalPsPublished = await Formation.countDocuments({ published: true, parcoursup_statut: "publié" });
  const totalPsNotPublished = await Formation.countDocuments({
    published: true,
    parcoursup_statut: "non publié",
  });

  logger.info(
    `Total formations publiées dans le catalogue : ${totalPublished}\n` +
      `Total formations hors périmètre : ${totalNotRelevant}/${totalPublished}\n` +
      `Total formations à publier (sous condition habilitation)" : ${totalToValidateHabilitation}/${totalPublished}\n` +
      `Total formations à publier (vérifier accès direct postbac)" : ${totalToValidate}/${totalPublished}\n` +
      `Total formations à publier (soumis à validation Recteur)" : ${totalToValidateRecteur}/${totalPublished}\n` +
      `Total formations à publier : ${totalToCheck}/${totalPublished}\n` +
      `Total formations en attente de publication : ${totalPending}/${totalPublished}\n` +
      `Total formations publiées sur ParcourSup : ${totalPsPublished}/${totalPublished}\n` +
      `Total formations NON publiées sur ParcourSup : ${totalPsNotPublished}/${totalPublished}`
  );
};

module.exports = { run };
