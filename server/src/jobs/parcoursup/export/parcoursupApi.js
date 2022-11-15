const axios = require("axios");
const logger = require("../../../common/logger");
const { createParcoursupToken } = require("../../../common/utils/jwtUtils");

const endpoint = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_ENDPOINT;
const privateKey = (process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY ?? "").replace(/\n */gm, "\n");
const pwd = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY_PWD;
const id = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_CERTIFICATE_ID;

/**
 * POST a formation to Parcoursup WS
 */
const postFormation = async (data) => {
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
 * POST a formation to Parcoursup WS
 */
const updateFormation = async (data) => {
  const token = createParcoursupToken({ data, privateKey, pwd, id });

  try {
    const { data: responseData } = await axios.post(
      "http://test2.parcoursup.fr/ApiFormation/api/formations/majFormation",
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return responseData;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

module.exports = {
  postFormation,
  updateFormation,
};
