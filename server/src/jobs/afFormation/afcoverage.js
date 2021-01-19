const { asyncForEach } = require("../../common/utils/asyncUtils");
const logger = require("../../common/logger");
const { AfFormation, ConvertedFormation } = require("../../common/model");
const matcher = require("./matcher");

async function updateMatchedFormation(formation) {
  if (
    !formation.matching_uai.find((x) => x.data_length > 0) &&
    !formation.matching_cfd.find((x) => x.data_length > 0)
  ) {
    await AfFormation.findByIdAndUpdate(formation.formation._id, {
      matching_type: null,
    });
    logger.info("UPDATE DB : No matching found", formation.matching_uai, formation.matching_cfd);
    return;
  }

  if (!formation.matching_uai.find((x) => x.data_length > 0)) {
    // traitement CFD
    logger.info("Applying CFD process ...");
    await updateDB(formation.formation, formation.matching_cfd);
  } else {
    // traitement UAI
    logger.info("Applying UAI process ...");
    await updateDB(formation.formation, formation.matching_uai);
  }
}

async function updateDB(formation, matching) {
  const found = matching.find((x) => x.data_length === 1);
  if (found) {
    await AfFormation.findByIdAndUpdate(formation._id, {
      matching_type: found.matching_strengh,
      matching_mna_formation: found.data,
    });

    logger.info(`UPDATE DB : Matching found, strengh : ${found.matching_strengh}`);
  } else {
    let matches = matching
      .filter((x) => x.data_length > 0)
      .reduce((acc, item) => {
        if (!acc || item.data_length < acc.data_length) {
          acc = item;
        }
        return acc;
      });

    try {
      await AfFormation.findByIdAndUpdate(formation._id, {
        matching_type: `${matches.matching_strengh}`,
        matching_mna_formation: matches.data,
      });

      logger.info(`UPDATE DB : Matching found, strengh : ${matches.matching_strengh}`);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = async () => {
  logger.info("Retreiving data from DB ...");

  const [afFormations, mnaFormations] = await Promise.all([
    AfFormation.find({ code_cfd: { $ne: null } }).lean(),
    ConvertedFormation.find().lean(),
  ]);

  logger.info("Starting matching processus ...");

  await asyncForEach(afFormations, async (formation) => {
    const result = matcher(formation, mnaFormations);
    logger.info(`Update ${formation._id} - ${formation.code_cfd} `);

    await updateMatchedFormation(result);
  });
};
