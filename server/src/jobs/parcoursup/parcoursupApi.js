/**
 * See https://test2.parcoursup.fr/ApiFormation/public/swagger-ui/index.html?configUrl=/ApiFormation/public/api-docs/swagger-config#/acces-formations-controller-rest/majFormation
 */

const axios = require("axios");
const logger = require("../../common/logger");
const { createParcoursupToken } = require("../../common/utils/jwtUtils");

const privateKey = (process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY ?? "").replace(/\n */gm, "\n");
const pwd = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY_PWD;
const id = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_CERTIFICATE_ID;

/**
 * POST a formation to Parcoursup WS
 */
const postFormation = async (data) => {
  const endpoint = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_ENDPOINT + "/ApiFormation/api/formations";
  const token = createParcoursupToken({ data, privateKey, pwd, id });

  try {
    const { data: responseData } = await axios.post(endpoint, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return responseData;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

/**
 * PUT a formation to Parcoursup WS
 */
const updateFormation = async (data) => {
  const endpoint =
    process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_ENDPOINT + "/ApiFormation/api/formations/majFormation";
  const token = createParcoursupToken({ data, privateKey, pwd, id });

  try {
    const { data: responseData } = await axios.post(endpoint, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return responseData;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

/**
 * GET formations from Parcoursup WS
 */
const getFormations = async (data) => {
  const endpoint =
    process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_ENDPOINT + "/ApiFormation/api/formations/publications/affectation";
  const token = createParcoursupToken({ data, privateKey, pwd, id });

  try {
    const { data: responseData } = await axios.get(endpoint, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return responseData;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

module.exports = {
  postFormation,
  updateFormation,
  getFormations,
};
