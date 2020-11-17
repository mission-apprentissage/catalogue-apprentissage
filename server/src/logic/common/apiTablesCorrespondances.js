const axios = require("axios");
const logger = require("../../common/logger");

// Cf Documentation : https://apprentissage.developer.azure-api.net/api-details
const apiEndpoint = "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

const getCfdInfo = async (cfd) => {
  try {
    const { data } = await axios.post(`${apiEndpoint}/cfd`, {
      cfd,
    });
    return data;
  } catch (error) {
    logger.error(`getCfdInfo: something went wrong`);
    return null;
  }
};

const getCpInfo = async (codePostal) => {
  try {
    const { data } = await axios.post(`${apiEndpoint}/code-postal`, {
      codePostal,
    });
    return data;
  } catch (error) {
    logger.error(`getCpInfo: something went wrong`);
    return null;
  }
};

module.exports = { getCfdInfo, getCpInfo };
