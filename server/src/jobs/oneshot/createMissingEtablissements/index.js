const { ConvertedFormation, RcoFormation, Etablissement } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const { createOrUpdateEtablissements } = require("../../../logic/updaters/etablissementUpdater");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const logger = require("../../../common/logger");

const run = async () => {
  const orphansTrainings = await ConvertedFormation.find({
    published: true,
    etablissement_reference_catalogue_published: true,
    etablissement_formateur_siret: { $ne: null },
    etablissement_formateur_id: null,
  });

  await asyncForEach(orphansTrainings, async (formation) => {
    // create etablissements
    const rcoFormation = await RcoFormation.findOne({ id_rco_formation: formation.id_rco_formation });
    if (rcoFormation) {
      await createOrUpdateEtablissements(rcoFormation._doc);

      // update formation
      const createdEtablissement = await Etablissement.findOne({ siret: formation.etablissement_formateur_siret });
      if (createdEtablissement) {
        formation.etablissement_formateur_id = createdEtablissement._id;
        await formation.save();
      } else {
        logger.error("etablissement not found ", formation.etablissement_formateur_siret);
      }
    } else {
      logger.error("rco formation not found! ", formation.id_rco_formation);
    }
  });
};

runScript(async () => {
  await run();
});
