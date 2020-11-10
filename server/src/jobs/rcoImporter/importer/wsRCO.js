const axios = require("axios");

const endpoint = "https://extranet.intercariforef.org/formations_apprentissage";
const params = {
  login: "mna",
  pwd: process.env.RCO_WS_PWD,
};

class WsRCO {
  constructor() {}

  /*
  day can be equal to -j-1 to get the export from yesterday
  */
  async getRCOcatalogue(day = "") {
    try {
      const response = await axios.get(`${endpoint}/catalogue-formations-apprentissage${day}.json`, {
        headers: {
          Authorization: `Basic ${this.encode64Token()}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response.status === 404) {
        console.log(`404 not found ${endpoint}/catalogue-formations-apprentissage${day}.json`);
        return [];
      }
      console.log(error);
      return null;
    }
  }

  encode64Token() {
    let buff = new Buffer.from(`${params.login}:${params.pwd}`);
    return buff.toString("base64");
  }
}

const wsRCO = new WsRCO();
module.exports = wsRCO;
