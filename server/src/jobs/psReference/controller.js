const { ConvertedFormation } = require("../../common/model");
const logger = require("../../common/logger");
const psReferenceMapper = require("../../logic/mappers/psReferenceMapper");
const { paginator } = require("../common/utils/paginator");
const { toBePublishedRules } = require("../common/utils/referenceUtils");

const run = async () => {
  // 1 - set "hors périmètre"
  await ConvertedFormation.updateMany(
    {
      parcoursup_statut: null,
    },
    { $set: { parcoursup_statut: "hors périmètre" } }
  );

  // 2 - check for published trainings in psup (set "publié") / but don't overwrite those on "non publié" status : it means a user chose not to publish
  await paginator(
    ConvertedFormation,
    { filter: { published: true, parcoursup_statut: { $ne: "non publié" } } },
    async (formation) => {
      const { parcoursup_reference, messages, error } = await psReferenceMapper({
        cfd: formation.cfd,
        siret_formateur: formation.etablissement_formateur_siret,
        siret_gestionnaire: formation.etablissement_gestionnaire_siret,
      });

      if (error) {
        // do nothing error is already logged in mapper
        return;
      }

      formation.parcoursup_reference = parcoursup_reference;

      if (parcoursup_reference) {
        formation.parcoursup_error = "success";
      } else {
        formation.parcoursup_error = messages?.error ?? null;
      }

      formation.last_update_at = Date.now();
      await formation.save();
    }
  );

  // update parcoursup_statut outside loop to not mess up with paginate
  await ConvertedFormation.updateMany(
    { parcoursup_error: "success" },
    { $set: { parcoursup_error: null, parcoursup_statut: "publié" } }
  );

  // 3 - set "à publier" for trainings matching psup eligibility rules
  //reset à publier
  await ConvertedFormation.updateMany(
    {
      parcoursup_statut: "à publier",
    },
    { $set: { parcoursup_statut: "hors périmètre" } }
  );

  // run only on those 'hors périmètre' to not overwrite actions of users !
  const filter = { published: true, parcoursup_statut: "hors périmètre" };

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
                  // "DIPLOME UNIVERSITAIRE DE TECHNOLOGIE",
                ],
              },
            },
            {
              $or: [
                { libelle_court: { $in: ["DCG", "MC4"] } },
                { libelle_court: "BM", niveau_formation_diplome: "36M" },
              ],
            },
          ],
        },
        {
          $or: [
            { "rncp_details.code_type_certif": { $nin: ["Titre", "TP"] } },
            {
              "rncp_details.code_type_certif": { $in: ["Titre", "TP"] },
              "rncp_details.active_inactive": "ACTIVE",
              niveau: { $in: ["5 (BTS, DUT...)", "6 (Licence...)"] },
            },
          ],
        },
        {
          $or: [{ niveau: "4 (Bac...)" }, { niveau: "5 (BTS, DUT...)" }, { niveau: "6 (Licence...)" }],
        },
      ],
    },
    { $set: { last_update_at: Date.now(), parcoursup_statut: "à publier" } }
  );

  // 4 - stats
  const totalPublished = await ConvertedFormation.countDocuments({ published: true });
  const totalErrors = await ConvertedFormation.countDocuments({ published: true, parcoursup_error: { $ne: null } });
  const totalNotRelevant = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "hors périmètre",
  });
  const totalToValidate = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "à publier (soumis à validation)",
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

  logger.info(`Total formations publiées dans le catalogue : ${totalPublished}`);
  logger.info(`Total formations avec erreur de référencement ParcourSup : ${totalErrors}`);
  logger.info(`Total formations hors périmètre : ${totalNotRelevant}/${totalPublished}`);
  logger.info(`Total formations à publier (soumis à validation) : ${totalToValidate}/${totalPublished}`);
  logger.info(`Total formations à publier : ${totalToCheck}/${totalPublished}`);
  logger.info(`Total formations en attente de publication : ${totalPending}/${totalPublished}`);
  logger.info(`Total formations publiées sur ParcourSup : ${totalPsPublished}/${totalPublished}`);
  logger.info(`Total formations NON publiées sur ParcourSup : ${totalPsNotPublished}/${totalPublished}`);
};

module.exports = { run };
