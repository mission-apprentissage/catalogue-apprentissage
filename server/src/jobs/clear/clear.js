const logger = require("../../common/logger");
const { rebuildIndex } = require("../../common/utils/esUtils");
const { MnaFormation, User } = require("../../common/model/index");

module.exports = async () => {
  await MnaFormation.deleteMany({});
  await rebuildIndex("mnaformation", MnaFormation);

  await User.deleteMany({});
  logger.info(`All mnaformation deleted`);
  logger.info(`All users deleted`);
};
