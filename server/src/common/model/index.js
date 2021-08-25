const { mongoose } = require("../mongodb");
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
  Role: createModel("role", schema.roleSchema),
  RcoFormation: createModel("rcoformation", schema.rcoFormationSchema),
  MnaFormation: createModel("mnaformation", schema.mnaFormationSchema, {
    esIndexName: "mnaformation",
  }),
  ConvertedFormation: createModel("convertedformation", schema.mnaFormationSchema, {
    esIndexName: "convertedformation",
  }),
  Report: createModel("report", schema.reportSchema),
  Log: createModel("log", schema.logSchema),
  // PsFormation: createModel("psformation", schema.psFormation2020Schema),
  PsReconciliation: createModel("psreconciliation", schema.psReconciliationSchema),
  PendingRcoFormation: createModel("pendingrcoformation", schema.mnaFormationSchema),
  AfFormation: createModel("afformation", schema.afFormationSchema),
  AfReconciliation: createModel("afreconciliation", schema.afReconciliationSchema),
  Etablissement: createModel("etablissement", schema.etablissementSchema),
  PsFormation: createModel("psformations", schema.psFormationSchema, {
    esIndexName: "psformations",
  }),
  SandboxFormation: createModel("sandboxformation", schema.mnaFormationSchema),
  Statistique: createModel("statistique", schema.statistiqueSchema),
  MessageScript: createModel("messageScript", schema.messageScriptSchema),
  ReglePerimetre: createModel("regleperimetre", schema.reglePerimetreSchema),
};
