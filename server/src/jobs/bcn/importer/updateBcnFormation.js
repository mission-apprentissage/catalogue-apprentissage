const logger = require("../../../common/logger");
const { BcnFormationDiplome } = require("../../../common/models");

module.exports = async (db, id, bcnFormation) => {
  try {
    await BcnFormationDiplome.findOneAndUpdate(
      { _id: id },
      { ...bcnFormation, last_update_at: Date.now() },
      { new: true }
    );
    logger.debug(`BCN Formation '${bcnFormation.FORMATION_DIPLOME}' successfully updated in db ${db.name}`);
  } catch (err) {
    logger.error({ err });
  }
};
