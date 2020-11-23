const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { MnaFormation } = require("../../common/model");

runScript(async ({ db }) => {
  const nbMnaFormationEntities = await MnaFormation.countDocuments({});
  logger.info(`Db ${db.name} - MnaFormation count : ${nbMnaFormationEntities}`);
});
