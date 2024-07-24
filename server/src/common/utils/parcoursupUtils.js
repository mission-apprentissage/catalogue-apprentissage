/** @typedef {import("../models/schema/formation").Formation} Formation */

const { parcoursupErrors } = require("../../constants/parcoursupErrors");
const csvToJson = require("convert-csv-to-json");

const FILE_PATH = "/data/uploads/mefs-parcoursup.csv";
let mefsAllowedOnParcoursup = null;

const loadMefsAllowedOnParcoursup = (jsonData = null) => {
  try {
    const lines = jsonData ?? csvToJson.getJsonFromCsv(FILE_PATH);
    mefsAllowedOnParcoursup = lines.map(({ MEF }) => MEF.trim());
  } catch (e) {
    console.error(e);
    mefsAllowedOnParcoursup = [];
  }
};

const findMefsForParcoursup = ({ bcn_mefs_10 }) => {
  if (!mefsAllowedOnParcoursup) {
    loadMefsAllowedOnParcoursup();
  }
  return bcn_mefs_10.filter(({ mef10 }) => mefsAllowedOnParcoursup.includes(mef10));
};

/**
 * @param {Formation} formation
 * @returns {{regexp: RegExp, description: string, action: string}}
 */
const getParcoursupError = (formation) => {
  const descriptor = parcoursupErrors.find((error) => formation.parcoursup_error.match(error.regexp));

  return descriptor;
};

/**
 * @param {Formation} formation
 * @returns {string}
 */
const getParcoursupErrorDescription = (formation) => {
  return getParcoursupError(formation)?.description;
};

/**
 * @param {Formation} formation
 * @returns {string}
 */
const getParcoursupErrorAction = (formation) => {
  return getParcoursupError(formation)?.action;
};

module.exports = {
  findMefsForParcoursup,
  loadMefsAllowedOnParcoursup,
  getParcoursupError,
  getParcoursupErrorDescription,
  getParcoursupErrorAction,
};
