const { ConvertedFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { toBePublishedRules } = require("../../common/utils/referenceUtils");

const run = async () => {
  // 1 - set "hors périmètre"
  await ConvertedFormation.updateMany(
    {
      parcoursup_statut: null,
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
  const filterHP = { published: true, parcoursup_statut: "hors périmètre" };

  await ConvertedFormation.updateMany(
    {
      ...filterHP,
      $and: [
        ...toBePublishedRules,
        {
          $or: [
            {
              "rncp_details.code_type_certif": { $in: ["Titre", "TP"] },
              "rncp_details.active_inactive": "ACTIVE",
              niveau: "6 (Licence...)",
            },
            { libelle_court: "DCG" },
          ],
        },
      ],
    },
    { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier (vérifier accès direct postbac)" } }
  );

  await ConvertedFormation.updateMany(
    {
      ...filterHP,
      $and: [
        ...toBePublishedRules,
        {
          libelle_court: "MC4",
        },
      ],
    },
    { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier (soumis à validation Recteur)" } }
  );

  // 3 - set "à publier" for trainings matching psup eligibility rules
  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filter = {
    published: true,
    parcoursup_statut: {
      $in: ["hors périmètre", "à publier (vérifier accès direct postbac)", "à publier (soumis à validation Recteur)"],
    },
  };

  await ConvertedFormation.updateMany(
    {
      ...filter,
      $and: [
        ...toBePublishedRules,
        {
          $or: [
            {
              diplome: {
                $in: [
                  "BREVET DE TECHNICIEN SUPERIEUR",
                  "BREVET DE TECHNICIEN SUPERIEUR AGRICOLE",
                  "CERTIFICAT DE SPECIALISATION AGRICOLE DE NIVEAU 4",
                ],
              },
            },
            {
              $or: [{ libelle_court: "BM", niveau_formation_diplome: "36M" }, { libelle_court: { $regex: /^TH3-/ } }],
            },
            {
              "rncp_details.code_type_certif": { $in: ["Titre", "TP"] },
              "rncp_details.active_inactive": "ACTIVE",
              niveau: "5 (BTS, DUT...)",
            },
          ],
        },
        {
          niveau: { $in: ["4 (Bac...)", "5 (BTS, DUT...)", "6 (Licence...)"] },
        },
      ],
    },
    { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier" } }
  );

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
