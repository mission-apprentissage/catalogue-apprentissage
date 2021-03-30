/**
 * Methodes liés aux tables de correspondances
 */
const logger = require("../logger");
const axios = require("axios");
const config = require("config");

const apiEndpoint = `${config.tableCorrespondance.endpoint}/api`;

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

module.exports = { getBcnInfo };
