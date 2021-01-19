const { ConvertedFormation } = require("../../common/model");
const logger = require("../../common/logger");
const psReferenceMapper = require("../../logic/mappers/psReferenceMapper");

const run = async () => {
  // 1 - set "non pertinent"
  await ConvertedFormation.updateMany(
    {
      parcoursup_statut: null,
    },
    { $set: { parcoursup_statut: "non pertinent" } }
  );

  // 2 - check for published trainings in psup (set "publié")
  // run only on those 'non pertinent' to not overwrite actions of users !
  const filter = { published: true, parcoursup_statut: "non pertinent" };

  let offset = 0;
  let limit = 100;
  let computed = 0;
  let nbFormations = 10;

  while (computed < nbFormations) {
    let { docs, total } = await ConvertedFormation.paginate(filter, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async (formation) => {
        computed += 1;
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
        formation.save();
      })
    );

    offset += limit;

    logger.info(`progress ${computed}/${total}`);
  }

  // update parcoursup_statut outside loop to not mess up with paginate
  await ConvertedFormation.updateMany(
    { parcoursup_error: "success" },
    { $set: { parcoursup_error: null, parcoursup_statut: "publié" } }
  );

  // 3 - set "à expertiser" for trainings matching psup eligibility rules
  await ConvertedFormation.updateMany(
    {
      ...filter,
      $and: [
        { cfd: { $ne: null } },
        { cfd: { $ne: "" } },
        { intitule_long: { $ne: null } },
        { intitule_long: { $ne: "" } },
        { intitule_court: { $ne: null } },
        { intitule_court: { $ne: "" } },
        {
          diplome: {
            $in: [
              "BREVET DE TECHNICIEN SUPERIEUR",
              "BREVET DE TECHNICIEN SUPERIEUR AGRICOLE",
              "MENTION COMPLEMENTAIRE",
              "CERTIFICAT DE SPECIALISATION AGRICOLE DE NIVEAU 4",
              "DIPLOME UNIVERSITAIRE DE TECHNOLOGIE",
            ],
          },
        },
        {
          $or: [{ niveau: "4 (Bac...)" }, { niveau: "5 (BTS, DUT...)" }, { niveau: "6 (Licence...)" }],
        },
        {
          $or: [
            {
              $or: [
                { etablissement_formateur_conventionne: "OUI" },
                {
                  etablissement_reference_declare_prefecture: "OUI",
                  etablissement_reference_datadock: "datadocké",
                },
              ],
            },
            {
              rncp_eligible_apprentissage: true,
              $or: [
                { rncp_etablissement_formateur_habilite: true },
                { rncp_etablissement_gestionnaire_habilite: true },
              ],
            },
          ],
        },
      ],
    },
    { $set: { last_update_at: Date.now(), parcoursup_statut: "à expertiser" } }
  );

  // 4 - stats
  const totalPublished = await ConvertedFormation.countDocuments({ published: true });
  const totalErrors = await ConvertedFormation.countDocuments({ published: true, parcoursup_error: { $ne: null } });
  const totalNotRelevant = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "non pertinent",
  });
  const totalToCheck = await ConvertedFormation.countDocuments({ published: true, parcoursup_statut: "à expertiser" });
  const totalPending = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "en cours de publication",
  });
  const totalPsPublished = await ConvertedFormation.countDocuments({ published: true, parcoursup_statut: "publié" });
  const totalPsNotPublished = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "non publié",
  });

  logger.info(`Total formations publiées dans le catalogue : ${totalPublished}`);
  logger.info(`Total formations avec erreur de référencement ParcourSup : ${totalErrors}`);
  logger.info(`Total formations non pertinentes : ${totalNotRelevant}/${totalPublished}`);
  logger.info(`Total formations à expertiser : ${totalToCheck}/${totalPublished}`);
  logger.info(`Total formations en cours de publication : ${totalPending}/${totalPublished}`);
  logger.info(`Total formations publiées sur ParcourSup : ${totalPsPublished}/${totalPublished}`);
  logger.info(`Total formations NON publiées sur ParcourSup : ${totalPsNotPublished}/${totalPublished}`);
};

module.exports = { run };
