const logSchema = require("./log");
const userSchema = require("./user");
const roleSchema = require("./role");
const rcoFormationSchema = require("./rcoFormation");
const formationSchema = require("./formation/formation");
const reportSchema = require("./report");
const affelnetFormationSchema = require("./affelnetFormation");
const etablissementSchema = require("./etablissement");
const parcoursupFormationSchema = require("./parcoursupFormation");
const statistiqueSchema = require("./statistique");
const alertSchema = require("./alert");
const reglePerimetreSchema = require("./reglePerimetre");
const consumptionSchema = require("./consumption");
const dualControlReportSchema = require("./dualControlReport");
const consoleStatSchema = require("./consoleStat");
const previousSeasonFormationSchema = require("./previousSeasonFormation");
const previousSeasonFormationStatSchema = require("./previousSeasonFormationStat");

module.exports = {
  logSchema,
  userSchema,
  roleSchema,
  rcoFormationSchema,
  formationSchema,
  reportSchema,
  affelnetFormationSchema,
  etablissementSchema,
  parcoursupFormationSchema,
  statistiqueSchema,
  alertSchema,
  reglePerimetreSchema,
  consumptionSchema,
  dualControlReportSchema,
  consoleStatSchema,
  previousSeasonFormationSchema,
  previousSeasonFormationStatSchema,
};
