const diffHistory = require("mongoose-diff-history/diffHistory");
const { mongoose } = require("../mongodb");
const { mongoosastic, getElasticInstance } = require("../esClient");
const schemas = require("../model/schema");

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

  if (options.diff) {
    schema.plugin(diffHistory.plugin, options.diff);
  }

  return mongoose.model(modelName, schema, options.collectionName);
};

module.exports = {
  User: createModel("user", schemas.get("user")),
  Role: createModel("role", schemas.get("role")),
  Formation: createModel("formation", schemas.get("formation"), {
    esIndexName: "formation",
    filter: (doc) => {
      return !doc.published;
    },
    diff: {
      omit: ["updates_history", "updated_at", "affelnet_statut_history", "parcoursup_statut_history"],
    },
  }),
  Report: createModel("report", schemas.get("report")),
  Log: createModel("log", schemas.get("log")),
  AffelnetFormation: createModel("affelnetformation", schemas.get("affelnetFormation")),
  Etablissement: createModel("etablissement", schemas.get("etablissement"), {
    esIndexName: "etablissements",
    filter: (doc) => {
      return !doc.published;
    },
    diff: {
      omit: ["updates_history", "updated_at"],
    },
  }),
  ParcoursupFormation: createModel("parcoursupformations", schemas.get("parcoursupFormation")),
  ParcoursupFormationCheck: createModel("parcoursupformationchecks", schemas.get("parcoursupFormationCheck")),
  SandboxFormation: createModel("sandboxformation", schemas.get("formation")),
  Statistique: createModel("statistique", schemas.get("statistique")),
  Alert: createModel("alert", schemas.get("alert")),
  ReglePerimetre: createModel("regleperimetre", schemas.get("reglePerimetre")),
  Consumption: createModel("consumption", schemas.get("consumption")),
  DualControlEtablissement: createModel("dualcontroletablissement", schemas.get("dualControlEtablissement")),
  DualControlFormation: createModel("dualcontrolformation", schemas.get("dualControlFormation")),
  DualControlReport: createModel("dualcontrolreport", schemas.get("dualControlReport")),
  DualControlPerimeterReport: createModel("dualcontrolperimeterreport", schemas.get("dualControlPerimeterReport")),
  ConsoleStat: createModel("consolestat", schemas.get("consoleStat")),
  PreviousSeasonFormation: createModel("previousSeasonFormation", schemas.get("previousSeasonFormation")),
  PreviousSeasonFormationStat: createModel("previousSeasonFormationStat", schemas.get("previousSeasonFormationStat")),
};
