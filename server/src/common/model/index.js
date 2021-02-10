const mongoose = require("mongoose");
const { mongoosastic, getElasticInstance } = require("../esClient");
const schema = require("../model/schema");

const createModel = (modelName, descriptor, options = {}) => {
  const schema = new mongoose.Schema(descriptor);
  schema.plugin(require("mongoose-paginate"));
  if (options.esIndexName) {
    schema.plugin(mongoosastic, { esClient: getElasticInstance(), index: options.esIndexName });
  }
  if (options.createMongoDBIndexes) {
    options.createMongoDBIndexes(schema);
  }
  return mongoose.model(modelName, schema, options.collectionName);
};

module.exports = {
  User: createModel("user", schema.userSchema),
  RcoFormation: createModel("rcoformation", schema.rcoFormationSchema),
  MnaFormation: createModel("mnaformation", schema.mnaFormationSchema, {
    esIndexName: "mnaformation",
  }),
  ConvertedFormation: createModel("convertedformation", schema.mnaFormationSchema, {
    esIndexName: "convertedformation",
  }),
  Report: createModel("report", schema.reportSchema),
  Log: createModel("log", schema.logSchema),
  PsFormation: createModel("psformation", schema.psFormationSchema),
  PsReconciliation: createModel("psreconciliation", schema.psReconciliationSchema),
  PendingRcoFormation: createModel("pendingrcoformation", schema.mnaFormationSchema),
  AfFormation: createModel("afformation", schema.afFormationSchema),
  AfReconciliation: createModel("afreconciliation", schema.afReconciliationSchema),
  Etablissement: createModel("etablissement", schema.etablissementSchema),
};
