const logger = require("../../../common/logger");
const { BcnFormationDiplome } = require("../../../common/models");

module.exports = async (db, bcnFormation) => {
  try {
    const bcnFormationDiplomeToAdd = new BcnFormationDiplome(bcnFormation);
    await bcnFormationDiplomeToAdd.save();
    logger.info(`BCN Formation '${bcnFormationDiplomeToAdd._id}' successfully added in db ${db.name}`);
  } catch (err) {
    logger.error({ err });
  }
};
