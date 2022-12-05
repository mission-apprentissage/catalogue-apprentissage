const affelnetFormationSchema = require("./affelnetFormation");
const alertSchema = require("./alert");
const consoleStatSchema = require("./consoleStat");
const consumptionSchema = require("./consumption");
const dualControlFormationSchema = require("./formation/dualControlFormation");
const dualControlPerimeterReportSchema = require("./dualControlPerimeterReport");
const dualControlReportSchema = require("./dualControlReport");
const etablissementSchema = require("./etablissement");
const formationSchema = require("./formation/formation");
const logSchema = require("./log");
const parcoursupFormationCheckSchema = require("./parcoursupFormationCheck");
const parcoursupFormationSchema = require("./parcoursupFormation");
const previousSeasonFormationSchema = require("./previousSeasonFormation");
const previousSeasonFormationStatSchema = require("./previousSeasonFormationStat");
const reglePerimetreSchema = require("./reglePerimetre");
const reportSchema = require("./report");
const roleSchema = require("./role");
const statistiqueSchema = require("./statistique");
const userSchema = require("./user");

module.exports = {
  affelnetFormationSchema,
  alertSchema,
  consoleStatSchema,
  consumptionSchema,
  dualControlFormationSchema,
  dualControlPerimeterReportSchema,
  dualControlReportSchema,
  etablissementSchema,
  formationSchema,
  logSchema,
  parcoursupFormationCheckSchema,
  parcoursupFormationSchema,
  previousSeasonFormationSchema,
  previousSeasonFormationStatSchema,
  reglePerimetreSchema,
  reportSchema,
  roleSchema,
  statistiqueSchema,
  userSchema,
};
