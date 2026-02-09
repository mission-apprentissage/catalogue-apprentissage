const logger = require("../../../common/logger");
const { Formation } = require("../../../common/models");
const config = require("config");

const run = async () => {
  const filterGeneral = { catalogue_published: true, published: true };

  const differences = await Formation.find(
    {
      ...filterGeneral,
      $expr: {
        $ne: ["$affelnet_statut", "$affelnet_last_statut"],
      },
    },
    {
      _id: 0,
      cle_ministere_educatif: 1,
      affelnet_statut: 1,
      affelnet_last_statut: 1,
      affelnet_perimetre: 1,
      affelnet_id: 1,
    }
  ).lean();

  config.env !== "local" && logger.info({ type: "job" }, differences);

  config.env === "local" && console.table(differences);
};
module.exports = { run };
