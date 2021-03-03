const { ConvertedFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { toBePublishedRules } = require("../../common/utils/referenceUtils");

const getMefRule = (...args) => {
  const rule = args.reduce((acc, regex) => {
    return [...acc, { mef_10_code: { $regex: regex } }, { "mefs_10.mef10": { $regex: regex } }];
  }, []);
  return { $or: rule };
};

const run = async () => {
  // set "hors périmètre"
  await ConvertedFormation.updateMany(
    {
      $or: [{ affelnet_statut: null }, { etablissement_reference_catalogue_published: false }],
    },
    { $set: { affelnet_statut: "hors périmètre" } }
  );

  // set "à publier (soumis à validation)" for trainings matching affelnet eligibility rules
  // reset "à publier" & "à publier (soumis à validation)"
  await ConvertedFormation.updateMany(
    {
      affelnet_statut: { $in: ["à publier (soumis à validation)", "à publier"] },
    },
    { $set: { affelnet_statut: "hors périmètre" } }
  );

  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filterHP = {
    published: true,
    etablissement_reference_catalogue_published: true,
    affelnet_statut: "hors périmètre",
  };
  await ConvertedFormation.updateMany(
    {
      ...filterHP,
      $and: [
        ...toBePublishedRules,
        {
          $or: [
            {
              diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
              $or: [
                {
                  ...getMefRule(/11$/),
                  $and: [getMefRule(/^240/)],
                },
                {
                  ...getMefRule(/31$/),
                  $and: [getMefRule(/^242/)],
                },
              ],
            },
            {
              diplome: "BAC PROFESSIONNEL",
              ...getMefRule(/21$/),
              $and: [getMefRule(/^246/)],
            },
            {
              diplome: "BAC PROFESSIONNEL AGRICOLE",
              ...getMefRule(/21$/),
              $and: [getMefRule(/^273/)],
            },

            {
              diplome: "BREVET PROFESSIONNEL",
              ...getMefRule(/21$/),
              $and: [getMefRule(/^254/)],
            },
            {
              diplome: "BREVET DES METIERS D'ART - BREVET DES METIERS DU SPECTACLE",
              ...getMefRule(/21$/),
              $and: [getMefRule(/^251/)],
            },
            {
              diplome: "MENTION COMPLEMENTAIRE",
              niveau: "3 (CAP...)",
              ...getMefRule(/11$/),
              $and: [getMefRule(/^253/, /^274/)],
            },
          ],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (Bac...)"] },
        },
      ],
    },
    { $set: { last_update_at: Date.now(), affelnet_statut: "à publier (soumis à validation)" } }
  );

  //  set "à publier" for trainings matching affelnet eligibility rules
  // run only on those "hors périmètre" & "à publier (soumis à validation)" to not overwrite actions of users !
  const filter = {
    published: true,
    etablissement_reference_catalogue_published: true,
    affelnet_statut: { $in: ["hors périmètre", "à publier (soumis à validation)"] },
  };

  await ConvertedFormation.updateMany(
    {
      ...filter,
      $and: [
        ...toBePublishedRules,
        {
          $or: [
            {
              diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
              ...getMefRule(/21$/),
              $and: [getMefRule(/^241/)],
            },
            {
              diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES AGRICOLES",
              ...getMefRule(/21$/),
              $and: [getMefRule(/^271/)],
            },
            {
              diplome: "BAC PROFESSIONNEL",
              ...getMefRule(/31$/),
              $and: [getMefRule(/^247/)],
            },
            {
              diplome: "BAC PROFESSIONNEL AGRICOLE",
              ...getMefRule(/31$/),
              $and: [getMefRule(/^276/)],
            },
          ],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (Bac...)"] },
        },
      ],
    },
    { $set: { last_update_at: Date.now(), affelnet_statut: "à publier" } }
  );

  // stats
  const totalPublished = await ConvertedFormation.countDocuments({ published: true });
  const totalErrors = await ConvertedFormation.countDocuments({ published: true, affelnet_error: { $ne: null } });
  const totalNotRelevant = await ConvertedFormation.countDocuments({
    published: true,
    affelnet_statut: "hors périmètre",
  });
  const totalToValidate = await ConvertedFormation.countDocuments({
    published: true,
    affelnet_statut: "à publier (soumis à validation)",
  });
  const totalToCheck = await ConvertedFormation.countDocuments({ published: true, affelnet_statut: "à publier" });
  const totalPending = await ConvertedFormation.countDocuments({
    published: true,
    affelnet_statut: "en attente de publication",
  });
  const totalAfPublished = await ConvertedFormation.countDocuments({ published: true, affelnet_statut: "publié" });
  const totalAfNotPublished = await ConvertedFormation.countDocuments({
    published: true,
    affelnet_statut: "non publié",
  });

  logger.info(
    `Total formations publiées dans le catalogue : ${totalPublished}\n` +
      `Total formations avec erreur de référencement Affelnet : ${totalErrors}\n` +
      `Total formations hors périmètre : ${totalNotRelevant}/${totalPublished}\n` +
      `Total formations à publier (soumis à validation) : ${totalToValidate}/${totalPublished}\n` +
      `Total formations à publier : ${totalToCheck}/${totalPublished}\n` +
      `Total formations en attente de publication : ${totalPending}/${totalPublished}\n` +
      `Total formations publiées sur Affelnet : ${totalAfPublished}/${totalPublished}\n` +
      `Total formations NON publiées sur Affelnet : ${totalAfNotPublished}/${totalPublished}`
  );
};

module.exports = { run };
