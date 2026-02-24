const diffHistory = require("./plugins/diffHistory/diffHistory");
const { mongoose } = require("../mongodb");

const createModel = (modelName, schemaDeclaration, options = {}) => {
  // console.log("createModel", { modelName, schemaDeclaration, options });

  if (!modelName) {
    throw Error("modelName must be defined");
  }

  if (!schemaDeclaration) {
    throw Error(`schemaDeclaration is not defined for model ${modelName}`);
  }

  const [schemaDescriptor, schemaOptions] = schemaDeclaration;
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  const schema = new mongoose.Schema(schemaDescriptor, schemaOptions);
  schema.plugin(require("mongoose-paginate"));

  if (options.elastic) {
    const { getElasticInstance } = require("../esClient");
    const { mongoosastic } = require("./plugins/mongoosastic");
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
