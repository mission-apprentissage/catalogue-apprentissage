const { Client } = require("@elastic/elasticsearch");
// const { mongoosastic } = require("./mongoosastic");
const config = require("config");

const getClientOptions = () => {
  switch (config.env) {
    case "recette":
    case "production":
      return {
        node: config.elasticSearch.node, // TODO HANDLE HTTPS CONNECTOR
      };
    case "local":
    default:
      return { node: config.elasticSearch.node };
  }
};

const createEsInstance = () => {
  const options = getClientOptions();
  const client = new Client({
    ...options,
    maxRetries: 5,
    requestTimeout: 60000,
  });

  return client;
};
const clientDefault = createEsInstance();
const getElasticInstance = () => clientDefault;

module.exports = {
  getElasticInstance,
  // mongoosastic,
};
