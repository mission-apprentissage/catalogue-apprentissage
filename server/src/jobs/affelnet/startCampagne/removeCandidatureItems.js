const { CandidatureRelation, CandidatureFormation } = require("../../../common/models");
const logger = require("../../../common/logger");

const run = async () => {
  await CandidatureRelation.deleteMany();
  logger.info({ type: "job" }, `CandidatureRelation dropped\n`);

  await CandidatureFormation.deleteMany();
  logger.info({ type: "job" }, `CandidatureFormation dropped\n`);
};

module.exports = {
  run,
};
