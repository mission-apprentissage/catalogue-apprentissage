const { mongoose } = require("../mongodb");
const { mongoosastic, getElasticInstance } = require("../esClient");
const schema = require("../model/schema");

const createModel = (modelName, [schemaDescriptor, schemaOptions], options = {}) => {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  const schema = new mongoose.Schema(schemaDescriptor, schemaOptions);
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
  User: createModel("user", schema.get("user")),
  Role: createModel("role", schema.get("role")),
  Formation: createModel("formation", schema.get("formation"), {
    esIndexName: "formation",
    filter: (doc) => {
      return !doc.published;
    },
  }),
  Report: createModel("report", schema.get("report")),
  Log: createModel("log", schema.get("log")),
  AffelnetFormation: createModel("affelnetformation", schema.get("affelnetFormation")),
  Etablissement: createModel("etablissement", schema.get("etablissement"), {
    esIndexName: "etablissements",
    filter: (doc) => {
      return !doc.published;
    },
  }),
  ParcoursupFormation: createModel("parcoursupformations", schema.get("parcoursupFormation")),
  ParcoursupFormationCheck: createModel("parcoursupformationchecks", schema.get("parcoursupFormationCheck")),
  SandboxFormation: createModel("sandboxformation", schema.get("formation")),
  Statistique: createModel("statistique", schema.get("statistique")),
  Alert: createModel("alert", schema.get("alert")),
  ReglePerimetre: createModel("regleperimetre", schema.get("reglePerimetre")),
  Consumption: createModel("consumption", schema.get("consumption")),
  DualControlEtablissement: createModel("dualcontroletablissement", schema.get("dualControlEtablissement")),
  DualControlFormation: createModel("dualcontrolformation", schema.get("dualControlFormation")),
  DualControlReport: createModel("dualcontrolreport", schema.get("dualControlReport")),
  DualControlPerimeterReport: createModel("dualcontrolperimeterreport", schema.get("dualControlPerimeterReport")),
  ConsoleStat: createModel("consolestat", schema.get("consoleStat")),
  PreviousSeasonFormation: createModel("previousSeasonFormation", schema.get("previousSeasonFormation")),
  PreviousSeasonFormationStat: createModel("previousSeasonFormationStat", schema.get("previousSeasonFormationStat")),
};
