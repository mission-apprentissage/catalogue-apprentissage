const { mongoose } = require("../mongodb");
const { mongoosastic, getElasticInstance } = require("../esClient");
const schema = require("../model/schema");

const createModel = (modelName, descriptor, options = {}) => {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

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
  Formation: createModel("formation", schema.formationSchema, {
    esIndexName: "formation",
  }),
  Report: createModel("report", schema.reportSchema),
  Log: createModel("log", schema.logSchema),
  Etablissement: createModel("etablissement", schema.etablissementSchema, {
    esIndexName: "etablissements",
  }),
  SandboxFormation: createModel("sandboxformation", schema.formationSchema),
  Statistique: createModel("statistique", schema.statistiqueSchema),
  Alert: createModel("alert", schema.alertSchema),
  Consumption: createModel("consumption", schema.consumptionSchema),
  DualControlEtablissement: createModel("dualcontroletablissement", schema.etablissementSchema),
  DualControlFormation: createModel("dualcontrolformation", schema.dualControlFormationSchema),
  DualControlReport: createModel("dualcontrolreport", schema.dualControlReportSchema),
  DualControlPerimeterReport: createModel("dualcontrolperimeterreport", schema.dualControlPerimeterReportSchema),
};
