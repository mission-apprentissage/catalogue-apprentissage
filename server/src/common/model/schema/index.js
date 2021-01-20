const logSchema = require("./log");
const sampleSchema = require("./sample");
const userSchema = require("./user");
const rcoFormationSchema = require("./rcoFormation");
const mnaFormationSchema = require("./mnaFormation/mnaFormation");
const psFormationSchema = require("./psFormation");
const reportSchema = require("./report");
const psReconciliationSchema = require("./psReconciliation");
const afFormationSchema = require("./afFormation");

module.exports = {
  sampleSchema,
  logSchema,
  userSchema,
  rcoFormationSchema,
  mnaFormationSchema,
  psFormationSchema,
  reportSchema,
  psReconciliationSchema,
  afFormationSchema,
};
