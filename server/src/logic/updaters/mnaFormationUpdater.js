const logger = require("../../common/logger");
const Joi = require("joi");
const { cfdMapper } = require("../mappers/cfdMapper");
const { codePostalMapper } = require("../mappers/codePostalMapper");
const { etablissementsMapper } = require("../mappers/etablissementsMapper");
const { diffFormation } = require("../common/utils/diffUtils");

const formationSchema = Joi.object({
  cfd: Joi.string().required(),
  etablissement_gestionnaire_siret: Joi.string().required(),
  etablissement_formateur_siret: Joi.string().required(),
  // Add cp ?
}).unknown();

const mnaFormationUpdater = async (formation) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const { result: cfdMapping, messages: cfdMessages } = await cfdMapper(formation.cfd);

    const { result: cpMapping, messages: cpMessages } = await codePostalMapper(formation.code_postal);

    // TODO handle cfdMessages, cpMessages

    const etablissementsMapping = await etablissementsMapper(
      formation.etablissement_gestionnaire_siret,
      formation.etablissement_formateur_siret
    );

    let published = etablissementsMapping.etablissement_reference_published;

    const updatedFormation = {
      ...formation,
      ...cfdMapping,
      ...cpMapping,
      ...etablissementsMapping,
      published,
    };
    // console.log(updatedFormation);

    // TODO 'updates_history':  Run a diff
    const diffResult = diffFormation(formation, updatedFormation);
    console.log(diffResult);
  } catch (error) {
    logger.error(error);
    return formation;
  }
};

module.exports.mnaFormationUpdater = mnaFormationUpdater;

/*
 * Update to db RCO Formation
 */
//   async updateRCOFormation(rcoFormation, updateInfo) {
//     const updates_history = this.buildUpdatesHistory(rcoFormation, updateInfo);
//     await RcoFormation.findOneAndUpdate(
//       { _id: rcoFormation._id },
//       {
//         ...rcoFormation,
//         ...updateInfo,
//         updates_history,
//         last_update_at: Date.now(),
//       },
//       { new: true }
//     );
//     const id = this._buildId(rcoFormation);
//     const updated = { mnaId: rcoFormation._id, rcoId: id };
//     this.updated.push(updated);
//     return updated;
//   }

/*
 * Build updates history
 */
// const buildUpdatesHistory = (nextFormation, updateInfo) => {
//   const from = Object.keys(updateInfo).reduce((acc, key) => {
//     acc[key] = nextFormation[key];
//     return acc;
//   }, {});
//   return [...nextFormation.updates_history, { from, to: { ...updateInfo }, updated_at: Date.now() }];
// };

// for (let ite = 0; ite < keys.length; ite++) {
//     const key = keys[ite];
//     updateInfo[key] = rcoFormationAdded[key];
//   }
