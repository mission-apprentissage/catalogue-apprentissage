const { pipeline, writeObject } = require("../../../common/utils/streamUtils");
const logger = require("../../../common/logger");
const { findOpcosFromCfd } = require("../../../logic/common/apiTablesCorrespondances");
const { ConvertedFormation, MnaFormation } = require("../../../common/model/index");
const { infosCodes, computeCodes } = require("../../../constants/opco");

const updateFormations = async (model, stats) => {
  await pipeline(
    await model.find({}).cursor(),
    writeObject(
      async (f) => {
        try {
          if (!f.cfd) {
            f.info_opcos = infosCodes.NotFoundable;
            f.info_opcos_intitule = computeCodes[infosCodes.NotFoundable];
          } else {
            const opcosForFormations = await findOpcosFromCfd(f.cfd);

            if (opcosForFormations?.length > 0) {
              logger.info(
                `${model.modelName}: Adding OPCOs ${opcosForFormations.map(
                  (x) => x.operateur_de_competences
                )} for formation ${f._id}`
              );
              f.opcos = opcosForFormations.map(({ operateur_de_competences }) => operateur_de_competences);
              f.info_opcos = infosCodes.Found;
              f.info_opcos_intitule = computeCodes[infosCodes.Found];
              stats.opcosUpdated++;
            } else {
              logger.info(`${model.modelName}: No OPCOs found for formation ${f._id} for cfd ${f.cfd}`);
              f.info_opcos = infosCodes.NotFound;
              f.info_opcos_intitule = computeCodes[infosCodes.NotFound];
              stats.opcosNotFound++;
            }
          }

          await f.save();
        } catch (e) {
          stats.errors++;
          logger.error(e);
        }
      },
      { parallel: 5 }
    )
  );
};

module.exports = async () => {
  logger.info(" -- Start of OPCOs Importer -- ");

  let stats = {
    opcosUpdated: 0,
    opcosNotFound: 0,
    errors: 0,
  };

  logger.info("Updating formations...");
  await updateFormations(ConvertedFormation, stats);
  await updateFormations(MnaFormation, stats);
  logger.info(" -- End of OPCOs Importer -- ");
  return stats;
};
