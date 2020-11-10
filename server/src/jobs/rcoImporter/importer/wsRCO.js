const axios = require("axios");
const config = require("config");

const endpoint = "https://extranet.intercariforef.org/formations_apprentissage";
const params = {
  login: "mna",
  pwd: config.rco.pwd,
};

/*
day can be equal to -j-1 to get the export from yesterday
*/
const getRCOcatalogue = async (day = "") => {
  try {
    const response = await axios.get(`${endpoint}/catalogue-formations-apprentissage${day}.json`, {
      headers: {
        Authorization: `Basic ${encode64Token()}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`404 not found ${endpoint}/catalogue-formations-apprentissage${day}.json`);
      return [];
    }
    console.log(error);
    return [];
  }
};

const encode64Token = () => {
  let buff = new Buffer.from(`${params.login}:${params.pwd}`);
  return buff.toString("base64");
};

module.exports = {
  getRCOcatalogue,
  encode64Token,
};
