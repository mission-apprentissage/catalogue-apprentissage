const { ConvertedFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const psReferenceMapper = require("../../../logic/mappers/psReferenceMapper");
const { paginator } = require("../../common/utils/paginator");

const run = async () => {
  // check for published trainings in psup (set "publié") / but don't overwrite those on "non publié" status : it means a user chose not to publish
  await paginator(
    ConvertedFormation,
    {
      filter: {
        published: true,
        etablissement_reference_catalogue_published: true,
        parcoursup_statut: { $ne: "non publié" },
        cfd_outdated: { $ne: true },
      },
    },
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

  // 4 - stats
  const totalPublished = await ConvertedFormation.countDocuments({ published: true });
  const totalPsPublished = await ConvertedFormation.countDocuments({ published: true, parcoursup_statut: "publié" });
  logger.info(`Total formations publiées sur ParcourSup : ${totalPsPublished}/${totalPublished}`);
};

module.exports = { run };
