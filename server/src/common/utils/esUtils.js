const logger = require("../logger");

const { getElasticInstance } = require("../esClient");

const rebuildIndex = async (index, schema, { filter, skipFound } = { skipFound: false, filter: {} }) => {
  let client = getElasticInstance();

  const { body: hasIndex } = await client.indices.exists({ index });
  if (hasIndex && !skipFound) {
    logger.info(`Removing '${index}' index...`);
    await client.indices.delete({ index });
  }

  logger.info(`Re-creating '${index}' index with mapping...`);
  let requireAsciiFolding = true;
  await schema.createMapping(requireAsciiFolding); // this explicit call of createMapping insures that the geo points fields will be treated accordingly during indexing

  logger.info(`Syncing '${index}' index ...`);
  await schema.synchronize(filter);
};

const deleteIndex = async (index) => {
  let client = getElasticInstance();

  const { body: hasIndex } = await client.indices.exists({ index });
  if (hasIndex) {
    logger.info(`Removing '${index}' index...`);
    await client.indices.delete({ index });
  } else {
    logger.info(`'${index}' index doesn't exist...`);
  }
};

module.exports = { rebuildIndex, deleteIndex };
