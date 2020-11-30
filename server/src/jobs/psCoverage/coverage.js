const { asyncForEach } = require("../../common/utils/asyncUtils");
const logger = require("../../common/logger");
const { PsFormation, MnaFormation } = require("../../common/model");
const matcher = require("./matcher");

async function updateMatchedFormation(formation) {
  if (
    !formation.matching_uai.find((x) => x.data_length > 0) &&
    !formation.matching_cfd.find((x) => x.data_length > 0)
  ) {
    await PsFormation.findByIdAndUpdate(formation.formation._id, {
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
    await PsFormation.findByIdAndUpdate(formation._id, {
      matching_type: "6",
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
      await PsFormation.findByIdAndUpdate(formation._id, {
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
  const [psFormations, mnaFormations] = await Promise.all([PsFormation.find().lean(), MnaFormation.find().lean()]);
  logger.info("Starting matching processus ...");

  await asyncForEach(psFormations, async (formation) => {
    const result = matcher(formation, mnaFormations);
    logger.info(`Update ${formation.libelle_uai_affilie} - ${formation.code_mef_10} `);

    await updateMatchedFormation(result);
  });
};
