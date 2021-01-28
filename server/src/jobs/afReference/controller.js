const { ConvertedFormation } = require("../../common/model");
const logger = require("../../common/logger");
const afReferenceMapper = require("../../logic/mappers/afReferenceMapper");
const { toBePublishedRules } = require("../common/utils/referenceUtils");

const run = async () => {
  // 1 - set "hors périmètre"
  await ConvertedFormation.updateMany(
    {
      affelnet_statut: null,
    },
    { $set: { affelnet_statut: "hors périmètre" } }
  );

  // 2 - check for published trainings in affelnet (set "publié")
  let offset = 0;
  let limit = 100;
  let computed = 0;
  let nbFormations = 10;

  while (computed < nbFormations) {
    let { docs, total } = await ConvertedFormation.paginate({ published: true }, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async (formation) => {
        computed += 1;
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
      })
    );

    offset += limit;

    logger.info(`progress ${computed}/${total}`);
  }

  // update affelnet_statut outside loop to not mess up with paginate
  await ConvertedFormation.updateMany(
    { affelnet_error: "success" },
    { $set: { affelnet_error: null, affelnet_statut: "publié" } }
  );

  // 3 - set "à publier" for trainings matching affelnet eligibility rules
  //reset à publier
  await ConvertedFormation.updateMany(
    {
      affelnet_statut: "à publier",
    },
    { $set: { affelnet_statut: "hors périmètre" } }
  );

  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filter = { published: true, affelnet_statut: "hors périmètre" };

  await ConvertedFormation.updateMany(
    {
      ...filter,
      $and: [
        ...toBePublishedRules,
        {
          $or: [
            { etablissement_formateur_uai: { $ne: null } },
            { etablissement_gestionnaire_uai: { $ne: null } },
            { uai_formation: { $ne: null } },
          ],
        },
        {
          diplome: {
            $nin: [
              "AUTRES DIPLOMES DE NIVEAU IV",
              "AUTRES DIPLOMES DE NIVEAU V",
              "CERTIFICAT DE SPECIALISATION AGRICOLE DE NIVEAU 4",
              "CERTIFICAT DE SPECIALISATION AGRICOLE DE NIVEAU 5",
              "BREVET D'ETUDES PROFESSIONNELLES",
              "BREVET D'ETUDES PROFESSIONNELLES AGRICOLES",
              "BAC TECHNOLOGIQUE",
              "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
              // "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU IV",
              // "BREVET PROFESSIONNEL",
              // "MENTION COMPLEMENTAIRE",
              // "BREVET DES METIERS D'ART - BREVET DES METIERS DU SPECTACLE",
            ],
          },
        },
        {
          $or: [{ niveau: "3 (CAP...)" }, { niveau: "4 (Bac...)" }],
        },
        {
          $or: [{ mef_10_code: null }, { mef_10_code: "" }, { mef_10_code: { $regex: /1$/ } }],
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
  logger.info(`Total formations à publier : ${totalToCheck}/${totalPublished}`);
  logger.info(`Total formations en attente de publication : ${totalPending}/${totalPublished}`);
  logger.info(`Total formations publiées sur Affelnet : ${totalAfPublished}/${totalPublished}`);
  logger.info(`Total formations NON publiées sur Affelnet : ${totalAfNotPublished}/${totalPublished}`);
};

module.exports = { run };
