/**
 * Mapper psReconciliation
 */

const logger = require("../../common/logger");
const { PsReconciliation } = require("../../common/model");

module.exports = async (payload) => {
  const { cfd, siret } = payload;

  if (!cfd || !siret) {
    throw new Error(`cfd and siret are required`);
  }

  try {
    const response = await PsReconciliation.find({
      code_cfd: cfd,
      $and: [
        {
          $or: [{ siret_formateur: siret }, { siret_gestionnaire: siret }],
        },
      ],
    });
    return response;
  } catch (error) {
    logger.error(error);
  }
};
