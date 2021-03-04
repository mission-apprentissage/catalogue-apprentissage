const logSchema = require("./log");
const userSchema = require("./user");
const rcoFormationSchema = require("./rcoFormation");
const mnaFormationSchema = require("./mnaFormation/mnaFormation");
const psFormation2020Schema = require("./psFormation");
const reportSchema = require("./report");
const psReconciliationSchema = require("./psReconciliation");
const afReconciliationSchema = require("./afReconciliation");
const afFormationSchema = require("./afFormation");
const etablissementSchema = require("./etablissement");
const psFormation2021Schema = require("./psFormation2021");

module.exports = {
  logSchema,
  userSchema,
  rcoFormationSchema,
  mnaFormationSchema,
  psFormation2020Schema,
  reportSchema,
  psReconciliationSchema,
  afReconciliationSchema,
  afFormationSchema,
  etablissementSchema,
  psFormation2021Schema,
};
