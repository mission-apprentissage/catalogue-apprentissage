const logSchema = require("./log");
const userSchema = require("./user");
const roleSchema = require("./role");
const rcoFormationSchema = require("./rcoFormation");
const mnaFormationSchema = require("./mnaFormation/mnaFormation");
const psFormation2020Schema = require("./psFormation");
const reportSchema = require("./report");
const psReconciliationSchema = require("./psReconciliation");
const afReconciliationSchema = require("./afReconciliation");
const afFormationSchema = require("./afFormation");
const etablissementSchema = require("./etablissement");
const psFormation2021Schema = require("./psFormation2021");
const statistiqueSchema = require("./statistique");
const messageScriptSchema = require("./messageScript");
const reglePerimetreSchema = require("./reglePerimetre");

module.exports = {
  logSchema,
  userSchema,
  roleSchema,
  rcoFormationSchema,
  mnaFormationSchema,
  psFormation2020Schema,
  reportSchema,
  psReconciliationSchema,
  afReconciliationSchema,
  afFormationSchema,
  etablissementSchema,
  psFormation2021Schema,
  statistiqueSchema,
  messageScriptSchema,
  reglePerimetreSchema,
};
