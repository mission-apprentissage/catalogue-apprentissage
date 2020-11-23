const logger = require("../logger");
const { getElasticInstance } = require("../esClient");

const rebuildIndex = async (index, schema) => {
  let client = getElasticInstance();

  logger.info(`Removing '${index}' index...`);
  await client.indices.delete({ index });

  logger.info(`Synching '${index}' index ...`);
  await schema.synchronize();
};

module.exports.rebuildIndex = rebuildIndex;
