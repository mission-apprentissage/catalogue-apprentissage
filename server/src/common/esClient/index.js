const { Client } = require("@elastic/elasticsearch");
const ElasticsearchScrollStream = require("elasticsearch-scroll-stream");
const { transformObject, mergeStreams } = require("../utils/streamUtils");
const mongoosastic = require("./mongoosastic");
const config = require("config");

const getClientOptions = () => {
  switch (config.env) {
    case "recette":
    case "production":
      return {
        node: `${config.publicUrl}/es`, // TODO HANDLE HTTPS CONNECTOR
      };
    case "local":
    default:
      return { node: `${config.publicUrl}/es` };
  }
};

const createEsInstance = () => {
  const options = getClientOptions();
  const client = new Client({
    ...options,
    maxRetries: 5,
    requestTimeout: 60000,
  });

  client.extend("searchDocumentsAsStream", () => {
    return (options) => {
      return mergeStreams(
        new ElasticsearchScrollStream(
          client,
          {
            scroll: "1m",
            size: "50",
            ...options,
          },
          ["_id"]
        ),
        transformObject((data) => {
          return JSON.parse(Buffer.from(data).toString());
        })
      );
    };
  });
  return client;
};
const clientDefault = createEsInstance();
const getElasticInstance = () => clientDefault;

module.exports = {
  getElasticInstance,
  mongoosastic,
};
