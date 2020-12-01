const logger = require("../logger");
const { getElasticInstance } = require("../esClient");

const rebuildIndex = async (index, schema, { skipNotFound } = { skipNotFound: false }) => {
  let client = getElasticInstance();

  if (!skipNotFound) {
    logger.info(`Removing '${index}' index...`);
    await client.indices.delete({ index });
  }

  logger.info(`Re-creating '${index}' index with mapping...`);
  let requireAsciiFolding = true;
  await schema.createMapping(requireAsciiFolding); // this explicit call of createMapping insures that the geo points fields will be treated accordingly during indexing

  logger.info(`Synching '${index}' index ...`);
  await schema.synchronize();
};

module.exports.rebuildIndex = rebuildIndex;
