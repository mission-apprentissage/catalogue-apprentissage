const affelnetFormationSchema = require("./affelnetFormation");
const alertSchema = require("./alert");
const campagneStartSchema = require("./campagneStart");
const consoleStatSchema = require("./consoleStat");
const consumptionSchema = require("./consumption");
const dualControlEtablissementSchema = require("./dualControlEtablissement");
const dualControlFormationSchema = require("./formation/dualControlFormation");
const etablissementSchema = require("./etablissement");
const formationSchema = require("./formation/formation");
const logSchema = require("./log");
const parcoursupFormationCheckSchema = require("./parcoursupFormationCheck");
const parcoursupFormationSchema = require("./parcoursupFormation");
const previousSeasonFormationSchema = require("./previousSeasonFormation");
const previousSeasonFormationStatSchema = require("./previousSeasonFormationStat");
const reglePerimetreSchema = require("./reglePerimetre");
const roleSchema = require("./role");
const statistiqueSchema = require("./statistique");
const userSchema = require("./user");

const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const schemasMap = new Map(
  Object.entries({
    affelnetFormation: [affelnetFormationSchema, { timestamps }],
    alert: [alertSchema, { timestamps }],
    campagneStart: [campagneStartSchema, { timestamps }],
    consoleStat: [consoleStatSchema, {}],
    consumption: [consumptionSchema, {}],
    dualControlEtablissement: [dualControlEtablissementSchema, {}],
    dualControlFormation: [dualControlFormationSchema, {}],
    etablissement: [etablissementSchema, { timestamps }],
    formation: [formationSchema, { timestamps }],
    log: [logSchema, {}],
    parcoursupFormation: [parcoursupFormationSchema, { timestamps }],
    parcoursupFormationCheck: [parcoursupFormationCheckSchema, {}],
    previousSeasonFormation: [previousSeasonFormationSchema, {}],
    previousSeasonFormationStat: [previousSeasonFormationStatSchema, {}],
    reglePerimetre: [reglePerimetreSchema, { timestamps }],
    role: [roleSchema, { timestamps }],
    statistique: [statistiqueSchema, { timestamps }],
    user: [userSchema, { timestamps }],
  })
);

module.exports = schemasMap;
