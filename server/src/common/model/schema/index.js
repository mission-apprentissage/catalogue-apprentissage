const logSchema = require("./log");
const userSchema = require("./user");
const rcoFormationSchema = require("./rcoFormation");
const mnaFormationSchema = require("./mnaFormation/mnaFormation");
const psFormationSchema = require("./psFormation");
const reportSchema = require("./report");
const psReconciliationSchema = require("./psReconciliation");
const afReconciliationSchema = require("./afReconciliation");
const afFormationSchema = require("./afFormation");
const etablissementSchema = require("./etablissement");

module.exports = {
  logSchema,
  userSchema,
  rcoFormationSchema,
  mnaFormationSchema,
  psFormationSchema,
  reportSchema,
  psReconciliationSchema,
  afReconciliationSchema,
  afFormationSchema,
  etablissementSchema,
};
