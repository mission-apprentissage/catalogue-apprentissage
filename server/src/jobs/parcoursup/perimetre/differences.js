const logger = require("../../../common/logger");
const { Formation } = require("../../../common/models");
const config = require("config");

const run = async () => {
  const filterGeneral = { catalogue_published: true, published: true };

  const differences = await Formation.find(
    {
      ...filterGeneral,
      $expr: {
        $ne: ["$parcoursup_statut", "$parcoursup_last_statut"],
      },
    },
    {
      _id: 0,
      cle_ministere_educatif: 1,
      parcoursup_statut: 1,
      parcoursup_last_statut: 1,
      parcoursup_perimetre: 1,
      parcoursup_id: 1,
    }
  ).lean();

  config.env !== "dev" && logger.info({ type: "job" }, differences);

  config.env === "dev" && console.table(differences);
};
module.exports = { run };
