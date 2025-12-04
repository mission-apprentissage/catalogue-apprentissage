const diffHistory = require("mongoose-diff-history/diffHistory");
const { mongoose } = require("../mongodb");
const { mongoosastic, getElasticInstance } = require("../esClient");

const createModel = (modelName, schemaDeclaration, options = {}) => {
  // console.log("createModel", { modelName, schemaDeclaration, options });

  const [schemaDescriptor, schemaOptions] = schemaDeclaration;
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  const schema = new mongoose.Schema(schemaDescriptor, schemaOptions);
  schema.plugin(require("mongoose-paginate"));
  if (options.elastic) {
    schema.plugin(mongoosastic, { esClient: getElasticInstance(), ...options.elastic });
  }

  if (options.createMongoDBIndexes) {
    options.createMongoDBIndexes(schema);
  }

  if (options.diff) {
    schema.plugin(diffHistory.plugin, options.diff);
  }

  return mongoose.model(modelName, schema, options.collectionName);
};

module.exports = { createModel };
