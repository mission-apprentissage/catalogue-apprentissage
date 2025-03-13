const { Formation } = require("../../../common/models");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const logger = require("../../../common/logger");

const run = async () => {
  await cursor(
    Formation.find({
      published: true,
      parcoursup_perimetre: true,
      cle_ministere_educatif: /#LAD$/,
      parcoursup_statut: { $ne: PARCOURSUP_STATUS.NON_PUBLIE },
    }),
    async (formation) => {
      logger.debug(
        { type: "job" },
        `La formation ${formation.cle_ministere_educatif} est 100% à distance, non publication en attendant l'arbitrage de la MOSS`
      );

      await Formation.updateOne(
        { cle_ministere_educatif: formation.cle_ministere_educatif },
        {
          $set: {
            parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
            parcoursup_raison_depublication: "En cours d'arbitrage / contacter la MOSS",
          },
          $push: {
            parcoursup_statut_history: {
              parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
              date: new Date(),
            },
          },
        }
      );
    }
  );
};

module.exports = { run };
