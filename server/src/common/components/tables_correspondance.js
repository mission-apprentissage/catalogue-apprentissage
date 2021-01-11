/**
 * Methodes liés aux tables de correspondances
 */
const logger = require("../logger");
const axios = require("axios");
const config = require("config");

const apiEndpoint = `${config.tableCorrespondance.endpoint}/api`;

module.exports = () => {
  return {
    getMefInfo: async (mef) => {
      try {
        const { data } = await axios.post(`${apiEndpoint}/mef`, {
          mef,
        });
        return data;
      } catch (error) {
        logger.error(`getMefInfo: something went wrong`);
        return null;
      }
    },
    getCfdInfo: async (cfd) => {
      try {
        const { data } = await axios.post(`${apiEndpoint}/cfd`, {
          cfd,
        });
        return data;
      } catch (error) {
        logger.error(`getCfdInfo: something went wrong`);
        return null;
      }
    },
    getCpInfo: async (codePostal) => {
      try {
        const { data } = await axios.post(`${apiEndpoint}/code-postal`, {
          codePostal,
        });
        return data;
      } catch (error) {
        logger.error(`getCpInfo: something went wrong`);
        return null;
      }
    },
  };
};
