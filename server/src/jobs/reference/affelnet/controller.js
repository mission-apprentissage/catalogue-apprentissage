const { ConvertedFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const afReferenceMapper = require("../../../logic/mappers/afReferenceMapper");
const { paginator } = require("../../common/utils/paginator");

const run = async () => {
  //  check for published trainings in affelnet (set "publié") / but don't overwrite those on "non publié" status : it means a user chose not to publish
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

  // 4 - stats
  const totalPublished = await ConvertedFormation.countDocuments({ published: true });
  const totalAfPublished = await ConvertedFormation.countDocuments({ published: true, affelnet_statut: "publié" });
  logger.info(`Total formations publiées sur Affelnet : ${totalAfPublished}/${totalPublished}`);
};

module.exports = { run };
