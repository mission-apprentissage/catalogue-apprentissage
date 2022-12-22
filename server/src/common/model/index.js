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
    schema.plugin(mongoosastic, { esClient: getElasticInstance(), index: options.esIndexName, filter: options.filter });
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
    filter: (doc) => {
      return !doc.published;
    },
  }),
  Report: createModel("report", schema.reportSchema),
  Log: createModel("log", schema.logSchema),
  AffelnetFormation: createModel("affelnetformation", schema.affelnetFormationSchema),
  Etablissement: createModel("etablissement", schema.etablissementSchema, {
    esIndexName: "etablissements",
    filter: (doc) => {
      return !doc.published;
    },
  }),
  ParcoursupFormation: createModel("parcoursupformations", schema.parcoursupFormationSchema),
  ParcoursupFormationCheck: createModel("parcoursupformationchecks", schema.parcoursupFormationCheckSchema),
  SandboxFormation: createModel("sandboxformation", schema.formationSchema),
  Statistique: createModel("statistique", schema.statistiqueSchema),
  Alert: createModel("alert", schema.alertSchema),
  ReglePerimetre: createModel("regleperimetre", schema.reglePerimetreSchema),
  Consumption: createModel("consumption", schema.consumptionSchema),
  DualControlEtablissement: createModel("dualcontroletablissement", schema.etablissementSchema),
  DualControlFormation: createModel("dualcontrolformation", schema.dualControlFormationSchema),
  DualControlReport: createModel("dualcontrolreport", schema.dualControlReportSchema),
  DualControlPerimeterReport: createModel("dualcontrolperimeterreport", schema.dualControlPerimeterReportSchema),
  ConsoleStat: createModel("consolestat", schema.consoleStatSchema),
  PreviousSeasonFormation: createModel("previousSeasonFormation", schema.previousSeasonFormationSchema),
  PreviousSeasonFormationStat: createModel("previousSeasonFormationStat", schema.previousSeasonFormationStatSchema),
};
