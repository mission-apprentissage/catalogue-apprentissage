const axios = require("axios");
const logger = require("../../common/logger");

const isApiEntrepriseUp = async () => {
  try {
    const endpoints = ["apie_2_etablissements", "apie_2_entreprises"];
    const { data } = await axios.get("https://entreprise.api.gouv.fr/watchdoge/dashboard/current_status");
    return data?.results?.filter(({ uname }) => endpoints.includes(uname)).every(({ code }) => code === 200);
  } catch (e) {
    logger.error(e);
    return false;
  }
};

module.exports = { isApiEntrepriseUp };
