const { asyncForEach } = require("../../common/utils/asyncUtils");
const { AfFormation, ConvertedFormation } = require("../../common/model");
const logger = require("../../common/logger");
const matcher = require("./matcher");

async function updateMatchedFormation({ formation, matching_cfd }) {
  if (matching_cfd.length === 0) return;

  let { matching_strengh, data } = matching_cfd[0];

  logger.info(`update ${formation._id} — strengh: ${matching_strengh}`);

  await AfFormation.findByIdAndUpdate(formation._id, {
    matching_type: matching_strengh,
    matching_mna_formation: data,
  });
}

module.exports = async (tableCorrespondance) => {
  logger.info("Retreiving data from DB ...");

  const [afFormations, mnaFormations] = await Promise.all([
    AfFormation.find({ code_cfd: { $ne: null } }).lean(),
    ConvertedFormation.find().lean(),
  ]);

  logger.info(`${afFormations.length} formations to update ...`);

  await asyncForEach(afFormations, async (formation) => {
    const { messages, result: resultTco } = await tableCorrespondance.getCpInfo(formation.code_postal);

    if (
      messages?.cp === "Ok" ||
      messages?.cp === `Update: Le code ${formation.code_postal} est un code commune insee`
    ) {
      formation.code_postal_modified = { ...resultTco };
    } else {
      formation.code_postal_modified = { code_postal: formation.code_postal };
    }

    const result = matcher(formation, mnaFormations);
    logger.info(`Update ${formation._id} - ${formation.code_cfd} `);

    await updateMatchedFormation(result);
  });
};
