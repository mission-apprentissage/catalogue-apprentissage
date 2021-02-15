const { ConvertedFormation } = require("../../common/model");
const logger = require("../../common/logger");
const afReferenceMapper = require("../../logic/mappers/afReferenceMapper");
const { paginator } = require("../common/utils/paginator");
const { toBePublishedRules } = require("../common/utils/referenceUtils");

const run = async () => {
  // 1 - set "hors périmètre"
  await ConvertedFormation.updateMany(
    {
      affelnet_statut: null,
    },
    { $set: { affelnet_statut: "hors périmètre" } }
  );

  // 2 - check for published trainings in affelnet (set "publié") / but don't overwrite those on "non publié" status : it means a user chose not to publish
  await paginator(
    ConvertedFormation,
    { filter: { published: true, affelnet_statut: { $ne: "non publié" } } },
    async (formation) => {
      const { affelnet_reference, messages, error } = await afReferenceMapper({
        cfd: formation.cfd,
        siret_formateur: formation.etablissement_formateur_siret,
        siret_gestionnaire: formation.etablissement_gestionnaire_siret,
      });

      if (error) {
        // do nothing error is already logged in mapper
        return;
      }

      formation.affelnet_reference = affelnet_reference;

      if (affelnet_reference) {
        formation.affelnet_error = "success";
      } else {
        formation.affelnet_error = messages?.error ?? null;
      }

      formation.last_update_at = Date.now();
      await formation.save();
    }
  );

  // update affelnet_statut outside loop to not mess up with paginate
  await ConvertedFormation.updateMany(
    { affelnet_error: "success" },
    { $set: { affelnet_error: null, affelnet_statut: "publié" } }
  );

  // 3 - set "à publier" & "à publier (soumis à validation)" for trainings matching affelnet eligibility rules
  // reset "à publier" & "à publier (soumis à validation)"
  await ConvertedFormation.updateMany(
    {
      affelnet_statut: { $in: ["à publier (soumis à validation)", "à publier"] },
    },
    { $set: { affelnet_statut: "hors périmètre" } }
  );

  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filterHP = { published: true, affelnet_statut: "hors périmètre" };
  await ConvertedFormation.updateMany(
    {
      ...filterHP,
      $and: [
        ...toBePublishedRules,
        {
          $or: [
            {
              diplome: {
                $in: [
                  "BREVET PROFESSIONNEL",
                  "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU IV",
                  "BREVET DES METIERS D'ART - BREVET DES METIERS DU SPECTACLE",
                ],
              },
            },
            {
              diplome: "MENTION COMPLEMENTAIRE",
              niveau: "3 (CAP...)",
            },
            {
              diplome: { $in: ["BAC PROFESSIONNEL", "BAC PROFESSIONNEL AGRICOLE"] },
              $or: [{ mef_10_code: { $regex: /21$/ } }, { "mefs_10.mef10": { $regex: /21$/ } }],
            },
            {
              diplome: {
                $in: ["CERTIFICAT D'APTITUDES PROFESSIONNELLES", "CERTIFICAT D'APTITUDES PROFESSIONNELLES AGRICOLES"],
              },
              $or: [{ mef_10_code: { $regex: /11$/ } }, { "mefs_10.mef10": { $regex: /11$/ } }],
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

  // run only on those "hors périmètre" & "à publier (soumis à validation)" to not overwrite actions of users !
  const filter = { published: true, affelnet_statut: { $in: ["hors périmètre", "à publier (soumis à validation)"] } };

  await ConvertedFormation.updateMany(
    {
      ...filter,
      $and: [
        ...toBePublishedRules,
        {
          $or: [
            {
              diplome: { $in: ["BAC PROFESSIONNEL", "BAC PROFESSIONNEL AGRICOLE"] },
              $or: [{ mef_10_code: { $regex: /31$/ } }, { "mefs_10.mef10": { $regex: /31$/ } }],
            },
            {
              diplome: {
                $in: ["CERTIFICAT D'APTITUDES PROFESSIONNELLES", "CERTIFICAT D'APTITUDES PROFESSIONNELLES AGRICOLES"],
              },
              $or: [{ mef_10_code: { $regex: /21$/ } }, { "mefs_10.mef10": { $regex: /21$/ } }],
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

  // 4 - stats
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

  logger.info(`Total formations publiées dans le catalogue : ${totalPublished}`);
  logger.info(`Total formations avec erreur de référencement Affelnet : ${totalErrors}`);
  logger.info(`Total formations hors périmètre : ${totalNotRelevant}/${totalPublished}`);
  logger.info(`Total formations à publier (soumis à validation) : ${totalToValidate}/${totalPublished}`);
  logger.info(`Total formations à publier : ${totalToCheck}/${totalPublished}`);
  logger.info(`Total formations en attente de publication : ${totalPending}/${totalPublished}`);
  logger.info(`Total formations publiées sur Affelnet : ${totalAfPublished}/${totalPublished}`);
  logger.info(`Total formations NON publiées sur Affelnet : ${totalAfNotPublished}/${totalPublished}`);
};

module.exports = { run };
