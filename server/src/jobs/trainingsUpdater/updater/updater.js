const { MnaFormation } = require("../../../common/model/index");
// const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { updateFormationFromCfd } = require("../../../logic/updaters/fromCfdUpdater");

const run = async (filter = {}) => {
  const trainings = await MnaFormation.find(filter);

  const result = await updateFormationFromCfd(trainings[0]._doc);
  console.log(result);

  // await asyncForEach(trainings, async (trainingItem) => {
  //   let updatedTraining = {
  //     ...trainingItem._doc,
  //   };

  //   /* if (!updatedNeeded) {
  //     console.info(`Training ${trainingItem._id} nothing to do`);
  //     return;
  //   }

  //   try {
  //     updatedTraining.last_update_at = Date.now();
  //     await Formation.findOneAndUpdate({ _id: trainingItem._id }, updatedTraining, { new: true });
  //     console.info(`Training ${trainingItem._id} has been updated`);
  //     // Add trainings
  //     if (!updateOnly) {
  //       await asyncForEach(trainingsToCreate, async trainingToAdd => {
  //         delete trainingToAdd._id;
  //         const doc = new Formation(trainingToAdd);
  //         await doc.save();
  //         logger.info(`Training ${doc._id} has been added`);
  //       });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }*/
  // });
};

module.exports = { run };
