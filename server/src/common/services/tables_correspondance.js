/**
 * Methodes liés aux tables de correspondances
 */
const logger = require("../logger");
const axios = require("axios");
const config = require("config");

const apiEndpoint = `${config.tableCorrespondance.endpoint}/api`;

const getMefInfo = async (mef) => {
  try {
    const { data } = await axios.post(`${apiEndpoint}/mef`, {
      mef,
    });
    return data;
  } catch (error) {
    logger.error(`getMefInfo: something went wrong`);
    return null;
  }
};

const getBcnInfo = async (options) => {
  let { page, limit, query, queryAsRegex } = { page: 1, limit: 10, ...options };
  let params = { page, limit, query, queryAsRegex };

  try {
    const { data } = await axios.get(`${apiEndpoint}/bcn/formationsDiplomes`, { params });
    return data;
  } catch (error) {
    logger.error(`getBcnInfo: something went wrong`);
    return null;
  }
};

const getCfdInfo = async (cfd, { checkService = false } = {}) => {
  try {
    const { data } = await axios.post(`${apiEndpoint}/v1/cfd`, {
      cfd,
    });

    if (checkService) {
      return { result: data, serviceAvailable: true };
    }
    return data;
  } catch (error) {
    console.log(error);
    logger.error(`getCfdInfo: something went wrong`);

    if (checkService) {
      let serviceAvailable = true;
      if (!error.response || (error.response.status >= 500 && error.response.status <= 599)) {
        serviceAvailable = false;
      }
      return { result: null, serviceAvailable };
    }

    return null;
  }
};

module.exports = { getMefInfo, getBcnInfo, getCfdInfo };
