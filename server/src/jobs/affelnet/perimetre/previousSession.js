const { Formation } = require("../../../common/models");
const { getPreviousSessionDateRules } = require("../../../common/utils/rulesUtils");
const { cursor } = require("../../../common/utils/cursor");
const logger = require("../../../common/logger");

const run = async () => {
  const filterSessionDate = getPreviousSessionDateRules();

  const filterPerimetre = {
    affelnet_perimetre: true,
  };

  const formationsInSession = new Set();

  (
    await Formation.find({
      ...filterPerimetre,
      ...filterSessionDate,
    }).select({ cle_ministere_educatif: 1 })
  ).forEach(({ cle_ministere_educatif }) => formationsInSession.add(cle_ministere_educatif));

  logger.debug("- Session précédente présente");
  await cursor(
    Formation.find({
      cle_ministere_educatif: { $in: [...formationsInSession] },
      affelnet_previous_session: { $ne: true },
    }).select({
      cle_ministere_educatif: 1,
    }),
    async ({ cle_ministere_educatif }) =>
      await Formation.updateOne({ cle_ministere_educatif }, { affelnet_previous_session: true })
  );

  logger.debug("- Session précédente manquante");
  await cursor(
    Formation.find({
      cle_ministere_educatif: { $nin: [...formationsInSession] },
      affelnet_previous_session: { $ne: false },
    }).select({
      cle_ministere_educatif: 1,
    }),
    async ({ cle_ministere_educatif }) =>
      await Formation.updateOne({ cle_ministere_educatif }, { affelnet_previous_session: false })
  );
};

module.exports = { run };
