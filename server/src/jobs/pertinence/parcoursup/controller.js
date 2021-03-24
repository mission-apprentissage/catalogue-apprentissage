const { ConvertedFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { updateTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");
const { aPublierVerifierAccesDirectPostBacRules, aPublierValidationRecteurRules, aPublierRules } = require("./rules");

const run = async () => {
  // 1 - set "hors périmètre"
  await ConvertedFormation.updateMany(
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
  await ConvertedFormation.updateMany(
    {
      parcoursup_statut: {
        $in: [
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

  await ConvertedFormation.updateMany(
    {
      ...filterHP,
      ...aPublierVerifierAccesDirectPostBacRules,
    },
    { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier (vérifier accès direct postbac)" } }
  );

  await ConvertedFormation.updateMany(
    {
      ...filterHP,
      ...aPublierValidationRecteurRules,
    },
    { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier (soumis à validation Recteur)" } }
  );

  // 3 - set "à publier" for trainings matching psup eligibility rules
  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filter = {
    parcoursup_statut: {
      $in: ["hors périmètre", "à publier (vérifier accès direct postbac)", "à publier (soumis à validation Recteur)"],
    },
  };

  await ConvertedFormation.updateMany(
    {
      ...filter,
      ...aPublierRules,
    },
    { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier" } }
  );

  // Push entry in tags history
  await updateTagsHistory("parcoursup_statut");

  // stats
  const totalPublished = await ConvertedFormation.countDocuments({ published: true });
  const totalErrors = await ConvertedFormation.countDocuments({ published: true, parcoursup_error: { $ne: null } });
  const totalNotRelevant = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "hors périmètre",
  });
  const totalToValidate = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "à publier (vérifier accès direct postbac)",
  });
  const totalToValidateRecteur = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "à publier (soumis à validation Recteur)",
  });
  const totalToCheck = await ConvertedFormation.countDocuments({ published: true, parcoursup_statut: "à publier" });
  const totalPending = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "en attente de publication",
  });
  const totalPsPublished = await ConvertedFormation.countDocuments({ published: true, parcoursup_statut: "publié" });
  const totalPsNotPublished = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "non publié",
  });

  logger.info(
    `Total formations publiées dans le catalogue : ${totalPublished}\n` +
      `Total formations avec erreur de référencement ParcourSup : ${totalErrors}\n` +
      `Total formations hors périmètre : ${totalNotRelevant}/${totalPublished}\n` +
      `Total formations à publier (vérifier accès direct postbac)" : ${totalToValidate}/${totalPublished}\n` +
      `Total formations à publier (soumis à validation Recteur)" : ${totalToValidateRecteur}/${totalPublished}\n` +
      `Total formations à publier : ${totalToCheck}/${totalPublished}\n` +
      `Total formations en attente de publication : ${totalPending}/${totalPublished}\n` +
      `Total formations publiées sur ParcourSup : ${totalPsPublished}/${totalPublished}\n` +
      `Total formations NON publiées sur ParcourSup : ${totalPsNotPublished}/${totalPublished}`
  );
};

module.exports = { run };
