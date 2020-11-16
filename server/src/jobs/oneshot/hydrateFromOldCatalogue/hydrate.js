const axios = require("axios");
const { mapping } = require("./mapping");
const { MnaFormation } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

const oldCatalogueEndpoint = "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";

const getOldFormations = async (page = 1, allFormations = []) => {
  try {
    const response = await axios.get(`${oldCatalogueEndpoint}/formations`, { params: { page, limit: 500 } });
    const { formations, pagination } = response.data;

    allFormations = allFormations.concat(formations); // Should be properly exploded, function should be pure
    console.log(allFormations.length);

    if (page < pagination.nombre_de_page) {
      return getOldFormations(page + 1, allFormations);
    } else {
      return allFormations;
    }
  } catch (error) {
    if (error.response.status === 504) {
      console.log("timeout");
      return [];
    } else {
      console.log(error);
    }
    throw new Error("Something went wrong");
  }
};

const run = async () => {
  const oldFormations = await getOldFormations();
  console.log(oldFormations.length);

  await asyncForEach(oldFormations, async (oldFormation) => {
    const mappedMnaFormation = mapping(oldFormation);
    const mnaFormation = new MnaFormation(mappedMnaFormation);
    await mnaFormation.save();
  });
};

module.exports = { run };
