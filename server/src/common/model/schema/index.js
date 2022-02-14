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
const messageScriptSchema = require("./messageScript");
const reglePerimetreSchema = require("./reglePerimetre");
const consumptionSchema = require("./consumption");

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
  messageScriptSchema,
  reglePerimetreSchema,
  consumptionSchema,
};
