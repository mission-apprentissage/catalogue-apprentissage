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
  Formation: createModel("formation", schema.formationSchema, {
    esIndexName: "formation",
  }),
  Report: createModel("report", schema.reportSchema),
  Log: createModel("log", schema.logSchema),
  PendingRcoFormation: createModel("pendingrcoformation", schema.formationSchema),
  AfFormation: createModel("afformation", schema.afFormationSchema),
  AfReconciliation: createModel("afreconciliation", schema.afReconciliationSchema),
  Etablissement: createModel("etablissement", schema.etablissementSchema),
  PsFormation: createModel("psformations", schema.psFormationSchema, {
    esIndexName: "psformations",
  }),
  SandboxFormation: createModel("sandboxformation", schema.formationSchema),
  Statistique: createModel("statistique", schema.statistiqueSchema),
  MessageScript: createModel("messageScript", schema.messageScriptSchema),
  ReglePerimetre: createModel("regleperimetre", schema.reglePerimetreSchema),
};
