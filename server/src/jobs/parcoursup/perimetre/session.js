const { Formation } = require("../../../common/models");
const { getSessionDateRules } = require("../../../common/utils/rulesUtils");
const { cursor } = require("../../../common/utils/cursor");
const logger = require("../../../common/logger");

const run = async () => {
  const filterSessionDate = await getSessionDateRules();

  const filterPerimetre = {
    parcoursup_perimetre: true,
  };

  const formationsInSession = new Set();

  (
    await Formation.find({
      ...filterPerimetre,
      ...filterSessionDate,
    }).select({ cle_ministere_educatif: 1 })
  ).forEach(({ cle_ministere_educatif }) => formationsInSession.add(cle_ministere_educatif));

  logger.debug("- Session présente");
  await cursor(
    Formation.find({
      cle_ministere_educatif: { $in: [...formationsInSession] },
      parcoursup_session: { $ne: true },
    }).select({
      cle_ministere_educatif: 1,
    }),
    async ({ cle_ministere_educatif }) =>
      await Formation.updateOne({ cle_ministere_educatif }, { parcoursup_session: true })
  );

  logger.debug("- Session manquante");
  await cursor(
    Formation.find({
      cle_ministere_educatif: { $nin: [...formationsInSession] },
      parcoursup_session: { $ne: false },
    }).select({
      cle_ministere_educatif: 1,
    }),
    async ({ cle_ministere_educatif }) =>
      await Formation.updateOne({ cle_ministere_educatif }, { parcoursup_session: false })
  );
};

module.exports = { run };
