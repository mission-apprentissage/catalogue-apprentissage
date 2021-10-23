const logSchema = require("./log");
const userSchema = require("./user");
const roleSchema = require("./role");
const rcoFormationSchema = require("./rcoFormation");
const formationSchema = require("./formation/formation");
const reportSchema = require("./report");
const afReconciliationSchema = require("./afReconciliation");
const afFormationSchema = require("./afFormation");
const etablissementSchema = require("./etablissement");
const psFormationSchema = require("./psFormation");
const statistiqueSchema = require("./statistique");
const messageScriptSchema = require("./messageScript");
const reglePerimetreSchema = require("./reglePerimetre");

module.exports = {
  logSchema,
  userSchema,
  roleSchema,
  rcoFormationSchema,
  formationSchema,
  reportSchema,
  afReconciliationSchema,
  afFormationSchema,
  etablissementSchema,
  psFormationSchema,
  statistiqueSchema,
  messageScriptSchema,
  reglePerimetreSchema,
};
