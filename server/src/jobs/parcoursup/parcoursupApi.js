/**
 * See
 * https://ws.parcoursup.fr/ApiFormation/public/swagger-ui/index.html#/
 */

const axios = require("axios");
// const logger = require("../../common/logger");
const { createParcoursupToken } = require("../../common/utils/jwtUtils");
const logger = require("../../common/logger");
const privateKey = (process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY ?? "").replace(/\n */gm, "\n");
const pwd = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY_PWD;
const id = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_CERTIFICATE_ID;

/**
 * POST a formation to Parcoursup WS
 */
const postFormation = async (data) => {
  const endpoint = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_ENDPOINT + "/ApiFormation/api/formations";
  const token = createParcoursupToken({ data, privateKey, pwd, id });

  logger.debug("ParcoursupAPI / postFormation", { endpoint, token, data });

  // eslint-disable-next-line no-useless-catch
  try {
    const { data: responseData } = await axios.post(endpoint, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return responseData;
  } catch (error) {
    // logger.error({ type: "job" }, error);
    throw error;
  }
};

/**
 * PUT a formation to Parcoursup WS
 */
const updateFormation = async (data) => {
  const endpoint =
    process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_ENDPOINT + "/ApiFormation/api/formations/majFormation";
  const token = createParcoursupToken({ data, privateKey, pwd, id });

  logger.debug("ParcoursupAPI / updateFormation", { endpoint, token, data });

  // eslint-disable-next-line no-useless-catch
  try {
    const { data: responseData } = await axios.post(endpoint, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return responseData;
  } catch (error) {
    // logger.error({ type: "job" }, error);
    throw error;
  }
};

/**
 * GET formations from Parcoursup WS
 */
const getFormations = async () => {
  const endpoint =
    process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_ENDPOINT + "/ApiFormation/api/formations/publications/affectation";
  const token = createParcoursupToken({ data: null, privateKey, pwd, id });

  logger.debug("ParcoursupAPI / getFormations", { endpoint, token });

  // eslint-disable-next-line no-useless-catch
  try {
    const { data: responseData } = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return responseData;
  } catch (error) {
    // logger.error({ type: "job" }, error);
    throw error;
  }
};

module.exports = {
  postFormation,
  updateFormation,
  getFormations,
};
