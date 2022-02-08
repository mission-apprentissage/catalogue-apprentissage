const { runScript } = require("../scriptWrapper");
const { ParcoursupFormation } = require("../../common/model");
const { asyncForEach } = require("../../common/utils/asyncUtils");

const run = async () => {
  ParcoursupFormation.pauseAllMongoosaticHooks();
  const dataset = await ParcoursupFormation.find(
    {},
    { matching_rejete_raison: 1, rapprochement_rejete_raisons: 1, rapprochement_rejete_raison_autre: 1 }
  );
  await asyncForEach(dataset, async (psformation) => {
    if (psformation.matching_rejete_raison) {
      const [raisonsString, details] = psformation.matching_rejete_raison.split("#-REJECT_COMPLEMENT-#");
      const raisons = raisonsString.split("||");

      psformation.rapprochement_rejete_raisons = raisons;
      psformation.rapprochement_rejete_raison_autre = details ?? null;

      await psformation.save();
    }
  });
};

module.exports = { run };

if (process.env.standalone) {
  runScript(async () => {
    await run();
  });
}
