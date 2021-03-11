const { ConvertedFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { aPublierSoumisAValidationRules, aPublierRules } = require("./rules");

const run = async () => {
  // set "hors périmètre"
  await ConvertedFormation.updateMany(
    {
      $or: [
        { affelnet_statut: null },
        { etablissement_reference_catalogue_published: false },
        { published: false },
        { cfd_outdated: true },
      ],
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
    affelnet_statut: "hors périmètre",
  };
  await ConvertedFormation.updateMany(
    {
      ...filterHP,
      ...aPublierSoumisAValidationRules,
    },
    { $set: { last_update_at: Date.now(), affelnet_statut: "à publier (soumis à validation)" } }
  );

  //  set "à publier" for trainings matching affelnet eligibility rules
  // run only on those "hors périmètre" & "à publier (soumis à validation)" to not overwrite actions of users !
  const filter = {
    affelnet_statut: { $in: ["hors périmètre", "à publier (soumis à validation)"] },
  };

  await ConvertedFormation.updateMany(
    {
      ...filter,
      ...aPublierRules,
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
