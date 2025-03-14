const logger = require("../logger");

const { getElasticInstance } = require("../esClient");

const rebuildIndex = async (index, schema, { filter, skipFound } = { skipFound: false, filter: {} }) => {
  logger.info({ type: "utils" }, `-- REBULDING ${index} INDEX ⏳`);
  let client = getElasticInstance();

  const hasIndex = await client.indices.exists({ index });
  if (hasIndex && !skipFound) {
    logger.debug({ type: "utils" }, `Removing '${index}' index...`);
    await client.indices.delete({ index });
  }

  logger.debug({ type: "utils" }, `Re-creating '${index}' index with mapping...`);
  // let requireAsciiFolding = true;
  await schema.createMapping(/*requireAsciiFolding*/); // this explicit call of createMapping insures that the geo points fields will be treated accordingly during indexing

  logger.debug({ type: "utils" }, `Syncing '${index}' index ...`);
  await schema.synchronize(filter);
  logger.info({ type: "utils" }, `-- REBULDING ${index} INDEX ✅`);
};

const deleteIndex = async (index) => {
  logger.info({ type: "utils" }, `-- DELETING ${index} INDEX ⏳`);

  let client = getElasticInstance();

  const hasIndex = await client.indices.exists({ index });
  if (hasIndex) {
    logger.debug({ type: "utils" }, `Removing '${index}' index...`);
    await client.indices.delete({ index });
  } else {
    logger.debug({ type: "utils" }, `'${index}' index doesn't exist...`);
  }
  logger.info({ type: "utils" }, `-- DELETING ${index} INDEX ✅`);
};

module.exports = { rebuildIndex, deleteIndex };
