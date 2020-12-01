const { RcoFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const cpVersailles = require("./assets/cpVersailles.json");
const cpToulouse = require("./assets/cpToulouse.json");
const cpLille = require("./assets/cpLille.json");

const run = async () => {
  const found = await RcoFormation.find({
    conversion_error: { $ne: null },
    etablissement_lieu_formation_code_postal: {
      $in: cpLille,
    },
  });

  const res = found.map(({ _id, conversion_error }) => `${_id} ${conversion_error}`);

  logger.info(`found ${res.length}`);
  logger.info(res.join("\n"));
};

runScript(async () => {
  await run();
});
