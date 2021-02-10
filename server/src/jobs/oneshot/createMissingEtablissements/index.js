const { RcoFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const { paginator } = require("../../common/utils/paginator");
const { createOrUpdateEtablissements } = require("../../../logic/updaters/etablissementUpdater");

const run = async () => {
  await paginator(RcoFormation, { filter: { converted_to_mna: true }, lean: true }, async (rcoFormation) => {
    await createOrUpdateEtablissements(rcoFormation);
  });
};

runScript(async () => {
  await run();
});
